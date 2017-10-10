import React, { Component } from 'react';
import { Animated, Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const DEFAULT_TOOLBAR_HEIGHT = 300;

export default class CollapsibleToolbar extends Component {
    static propTypes = {
        imageSource: PropTypes.string.isRequired,
        collapsedNavBarBackgroundColor: PropTypes.string,
        renderContent: PropTypes.func.isRequired,
        renderNavBar: PropTypes.func.isRequired,
        renderToolBar: PropTypes.func,
        toolBarHeight: PropTypes.number,
        translucentStatusBar: PropTypes.bool
    };

    static defaultProps = {
        collapsedNavBarBackgroundColor: '#FFF',
        renderToolBar: undefined,
        toolBarHeight: DEFAULT_TOOLBAR_HEIGHT,
        translucentStatusBar: false
    };

    constructor(props) {
        super(props);

        const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
        const ANDROID_STATUS_BAR_HEIGHT = props.translucentStatusBar ? StatusBar.currentHeight : 0;

        this.statusBarHeight = Platform.OS === 'ios' ? 20 : ANDROID_STATUS_BAR_HEIGHT;
        this.navBarHeight = APPBAR_HEIGHT + this.statusBarHeight;
        this.maxScrollableHeight = props.toolBarHeight - this.navBarHeight;
        const inputRange = [this.maxScrollableHeight - 0.1, this.maxScrollableHeight];

        this.scrollOffsetY = new Animated.Value(0);

        this.opacity = this.scrollOffsetY.interpolate({
            inputRange: [this.maxScrollableHeight / 2, this.maxScrollableHeight],
            outputRange: [0, 1]
        });

        this.zIndex = this.scrollOffsetY.interpolate({
            inputRange: [this.maxScrollableHeight / 2, this.maxScrollableHeight],
            outputRange: [0, 1000]
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
                    <Animated.View
                        style={[
                            styles.toolBarOverlay,
                            {
                                backgroundColor: collapsedNavBarBackgroundColor,
                                height: toolBarHeight,
                                opacity: this.opacity,
                                zIndex: this.zIndex
                            }
                        ]}
                    />

                    <View>
                        {renderToolBar
                            ? renderToolBar()
                            : <Image
                                source={{ uri: imageSource || '' }}
                                style={{ height: toolBarHeight }}
                            />
                        }
                    </View>

                    {renderContent()}
                </Animated.ScrollView>

                <Animated.View
                    style={[
                        styles.navBarContainer,
                        {
                            backgroundColor: this.navBackgroundColor,
                            height: this.navBarHeight,
                            paddingTop: this.statusBarHeight,
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
