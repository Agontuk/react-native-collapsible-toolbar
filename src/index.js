import React, { Component } from 'react';
import { Animated, Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

import { ifIphoneX } from './helper';

const DEFAULT_TOOLBAR_HEIGHT = 300;

export default class CollapsibleToolbar extends Component {
    static propTypes = {
        collapsedNavBarBackgroundColor: PropTypes.string,
        imageSource: PropTypes.string,
        onContentScroll: PropTypes.func,
        renderContent: PropTypes.func.isRequired,
        renderNavBar: PropTypes.func.isRequired,
        renderNavBarNoTitle: PropTypes.func,
        renderToolBar: PropTypes.func,
        toolBarHeight: PropTypes.number,
        navBarHeight: PropTypes.number,
        translucentStatusBar: PropTypes.bool
    };

    static defaultProps = {
        collapsedNavBarBackgroundColor: '#FFF',
        imageSource: '',
        onContentScroll: undefined,
        renderToolBar: undefined,
        toolBarHeight: DEFAULT_TOOLBAR_HEIGHT,
        translucentStatusBar: false
    };

    constructor(props) {
        super(props);

        const APPBAR_HEIGHT = this.props.navBarHeight ? this.props.navBarHeight : (Platform.OS === 'ios' ? 44 : 56);
        const ANDROID_STATUS_BAR_HEIGHT = props.translucentStatusBar ? StatusBar.currentHeight : 0;

        this.statusBarHeight = Platform.OS === 'ios' ? ifIphoneX(44, 20) : ANDROID_STATUS_BAR_HEIGHT;
        this.navBarHeight = APPBAR_HEIGHT + this.statusBarHeight;
        this.maxScrollableHeight = props.toolBarHeight - this.navBarHeight;

        const inputRange1 = [this.maxScrollableHeight / 2, this.maxScrollableHeight];
        const inputRange2 = [this.maxScrollableHeight - 0.1, this.maxScrollableHeight];

        this.scrollOffsetY = new Animated.Value(0);

        this.toolBarOpacity = this.scrollOffsetY.interpolate({
            inputRange: inputRange1,
            outputRange: [1, 0]
        });

        this.toolBarOverlayOpacity = this.scrollOffsetY.interpolate({
            inputRange: inputRange1,
            outputRange: [0, 1]
        });

        this.navBarOpacity = this.scrollOffsetY.interpolate({
            inputRange: inputRange2,
            outputRange: [0, 1]
        });

        this.navBarOverlayOpacity = this.scrollOffsetY.interpolate({
            inputRange: inputRange2,
            outputRange: [1, 0]
        });
    }

    render() {
        const {
            collapsedNavBarBackgroundColor,
            imageSource,
            onContentScroll,
            renderContent,
            renderNavBar,
            renderNavBarNoTitle,
            renderToolBar,
            toolBarHeight,
            ...props
        } = this.props;

        if (!renderToolBar && !imageSource) {
            // eslint-disable-next-line no-console
            console.error('Either an image source or a custom toolbar component must be provided');
        }

        return (
            <View style={styles.container}>
                <Animated.ScrollView
                    {...props}
                    scrollEventThrottle={1}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.scrollOffsetY } } }],
                        {
                            useNativeDriver: true,
                            listener: onContentScroll
                        }
                    )}
                >
                    <Animated.View
                        style={[
                            styles.toolBarOverlay,
                            {
                                backgroundColor: collapsedNavBarBackgroundColor,
                                height: toolBarHeight,
                                opacity: this.toolBarOverlayOpacity
                            }
                        ]}
                    />

                    <Animated.View style={{ opacity: this.toolBarOpacity }}>
                        {renderToolBar
                            ? renderToolBar()
                            : <Image
                                source={{ uri: imageSource || '' }}
                                style={{ height: toolBarHeight }}
                            />
                        }
                    </Animated.View>

                    {renderContent()}
                </Animated.ScrollView>

                <Animated.View
                    style={[
                        styles.navBarContainer,
                        {
                            backgroundColor: collapsedNavBarBackgroundColor,
                            height: this.navBarHeight,
                            opacity: this.navBarOpacity,
                            paddingTop: this.statusBarHeight
                        }
                    ]}
                >
                    {renderNavBar()}
                </Animated.View>

                <Animated.View
                    style={[
                        styles.navBarOverlay,
                        {
                            height: this.navBarHeight,
                            opacity: this.navBarOverlayOpacity,
                            paddingTop: this.statusBarHeight
                        }
                    ]}
                >
                    {renderNavBarNoTitle ? renderNavBarNoTitle() : renderContent()}
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
                shadowColor: 'black',
                shadowOpacity: 0.1,
                shadowRadius: StyleSheet.hairlineWidth,
                shadowOffset: {
                    height: StyleSheet.hairlineWidth
                },
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: 'rgba(0, 0, 0, .3)'
            },
            android: {
                elevation: 4
            }
        })
    },
    navBarOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        position: 'absolute',
        left: 0,
        right: 0
    }
});
