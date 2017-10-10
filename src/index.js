import React, { Component } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const DEFAULT_TOOLBAR_HEIGHT = 300;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
const NAV_BAR_HEIGHT = APPBAR_HEIGHT + STATUS_BAR_HEIGHT;

export default class CollapsibleToolbar extends Component {
    static propTypes = {
        imageSource: PropTypes.string.isRequired,
        collapsedNavBarBackgroundColor: PropTypes.string,
        renderContent: PropTypes.func.isRequired,
        renderNavBar: PropTypes.func.isRequired,
        renderToolBar: PropTypes.func,
        toolBarHeight: PropTypes.number
    };

    static defaultProps = {
        collapsedNavBarBackgroundColor: '#FFF',
        renderToolBar: undefined,
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
        const {
            collapsedNavBarBackgroundColor,
            imageSource,
            renderContent,
            renderNavBar,
            renderToolBar,
            toolBarHeight
        } = this.props;


        if (!renderToolBar && !imageSource) {
            // eslint-disable-next-line no-console
            console.error('Either an image source or a custom toolbar component must be provided');
        }

        return (
            <View style={styles.container}>
                <Animated.ScrollView
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{
                        nativeEvent: { contentOffset: { y: this.scrollOffsetY } }
                    }])}
                >
                    <View>
                        {renderToolBar
                            ? renderToolBar()
                            : <Image
                                source={{ uri: imageSource || '' }}
                                style={{ height: toolBarHeight }}
                            />
                        }
                    </View>

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

                    {renderContent()}
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
                    {renderNavBar()}
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
