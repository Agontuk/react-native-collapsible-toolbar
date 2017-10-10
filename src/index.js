import React, { Component } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const DEFAULT_TOOLBAR_HEIGHT = 300;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const NAV_BAR_HEIGHT = APPBAR_HEIGHT + STATUS_BAR_HEIGHT;

export default class CollapsibleToolbar extends Component {
    static propTypes = {
        renderContent: PropTypes.func.isRequired,
        renderNavBar: PropTypes.func.isRequired,
        collapsedNavBarBackgroundColor: PropTypes.string,
        toolBarHeight: PropTypes.number
    };

    static defaultProps = {
        collapsedNavBarBackgroundColor: '#FFF',
        toolBarHeight: DEFAULT_TOOLBAR_HEIGHT
    };

    constructor(props) {
        super(props);

        const MAX_SCROLLABLE_HEIGHT = props.toolBarHeight - NAV_BAR_HEIGHT;
        const inputRange = [MAX_SCROLLABLE_HEIGHT - 0.1, MAX_SCROLLABLE_HEIGHT];

        this.scrollOffsetY = new Animated.Value(0);

        this.opacity = this.scrollOffsetY.interpolate({
            inputRange: [MAX_SCROLLABLE_HEIGHT / 2, MAX_SCROLLABLE_HEIGHT],
            outputRange: [0, 1]
        });

        this.navBackgroundColor = this.scrollOffsetY.interpolate({
            inputRange,
            outputRange: ['rgba(0, 0, 0, 0)', props.collapsedNavBarBackgroundColor],
            extrapolate: 'clamp'
        });

        this.navBottomBorder = this.scrollOffsetY.interpolate({
            inputRange,
            outputRange: [0, StyleSheet.hairlineWidth],
            extrapolate: 'clamp'
        });

        this.navElevation = this.scrollOffsetY.interpolate({
            inputRange,
            outputRange: [0, 4],
            extrapolate: 'clamp'
        });
    }

    render() {
        const { collapsedNavBarBackgroundColor, toolBarHeight } = this.props;

        return (
            <View style={styles.container}>
                <Animated.ScrollView
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{
                        nativeEvent: { contentOffset: { y: this.scrollOffsetY } }
                    }])}
                >
                    <Image
                        source={{ uri: 'https://lorempixel.com/400/300/' }}
                        style={{ height: toolBarHeight }}
                    />

                    <Animated.View
                        style={[
                            styles.toolBarOverlay,
                            {
                                opacity: this.opacity,
                                height: toolBarHeight,
                                backgroundColor: collapsedNavBarBackgroundColor
                            }
                        ]}
                    />

                    {this.props.renderContent()}
                </Animated.ScrollView>

                <Animated.View
                    style={[
                        styles.navBarContainer,
                        {
                            backgroundColor: this.navBackgroundColor,
                            ...Platform.select({
                                ios: {
                                    borderBottomWidth: this.navBottomBorder
                                },
                                android: {
                                    elevation: this.navElevation
                                }
                            })
                        }
                    ]}
                >
                    {this.props.renderNavBar()}
                </Animated.View>
            </View>
        );
    }
}

const styles = {
    container: {
        flex: 1
    },
    toolBarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
    },
    navBarContainer: {
        paddingTop: STATUS_BAR_HEIGHT,
        height: STATUS_BAR_HEIGHT + APPBAR_HEIGHT,
        position: 'absolute',
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                // shadowColor: 'black',
                // shadowOpacity: 0.1,
                // shadowRadius: StyleSheet.hairlineWidth,
                // shadowOffset: {
                //     height: StyleSheet.hairlineWidth
                // },
                borderBottomColor: 'rgba(0, 0, 0, .3)'
            }
        })
    }
};
