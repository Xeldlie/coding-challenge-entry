import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import {Chip, List} from "react-native-paper";
import Animated, {useAnimatedStyle, useSharedValue, withTiming, Easing} from 'react-native-reanimated';

type ProductItemProps = {
    name: String;
    date: Date;
    image: string;
    categories: String;
}

// ImageContainer handles image of product or placeholder
const ImageContainer = (props: {imageurl: string}) => {
    return (
        <View style={styles.imageContainer}>
            <Image source={
                props.imageurl
                    ? { uri: props.imageurl }
                    : require('../assets/placeholder.png')
            }
                   style={styles.image}
            />
        </View>
    )
}

// HeaderContainer handles everything in header
const HeaderContainer = (props: {productName: String, productDate: Date, expanded: boolean}) => {
    // Check if item is < 7 days
    const isNew = (new Date()).getTime() - new Date(props.productDate).getTime() <= 7 * 24 * 60 * 60 * 1000;

    return (
        <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
                {/* Title linebreaks on expansion, and else uses ... to cut off */}
                <Text
                    numberOfLines={props.expanded ? undefined : 1 }
                    style={styles.titleText}>
                    {props.productName}
                </Text>
                {/* Only show "New" tag on relevant items */}
                {isNew && (
                    <View style={styles.headerIcon}>
                        <Image
                            source={require('../assets/tag.png')}
                            style={{marginHorizontal: 'auto'}}
                        />
                        <List.Icon {...props} icon={props.expanded ? "chevron-up" : "chevron-down"} style={{position: 'absolute', right: 0, alignSelf: 'flex-start'}} />
                    </View>)}
                {!isNew && (
                    <List.Icon {...props} icon={props.expanded ? "chevron-up" : "chevron-down"} style={{alignSelf: 'flex-start'}} />)}

            </View>
            <View>
                <Text style={styles.descriptionText}>{props.productDate.toLocaleDateString("de-DE")}</Text>
            </View>
        </View>
    )
}

// The TagContainer to handle tags
const TagContainer = (props: {tagList: String}) => {
    const tags = props.tagList ? props.tagList.split(',').map(tag => tag.trim()): [];
    return (
        <View style={styles.tagContainer}>
            {tags.map((tag,index) =>(
                <Chip key={index} style={styles.tag}>
                    <Text style={styles.tagText} numberOfLines={2}>{tag}</Text>
                </Chip>
            ))}
        </View>
    );
}

const ProductItem = (props: ProductItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const offscreenRef = useRef(null);

    const animatedHeight = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.value,
    }));

    useEffect(() => {
        // Measure offscreen height of TagContainer to get accordion right
        offscreenRef.current.measure((x, y, width, height) => {
            setContentHeight(height);
        });
    }, []);

    const toggleExpand = () => {
        if (isExpanded) {
            // Collapse with easing
            animatedHeight.value = withTiming(0, { duration: 600, easing: Easing.ease });
        } else {
            // Expand to measured height with easing
            animatedHeight.value = withTiming(contentHeight, { duration: 600, easing: Easing.ease });
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.productContainer}>
            <ImageContainer imageurl={props.image}/>
            <View style={styles.infoContainer}>
                <Pressable onPress={toggleExpand}>
                    <HeaderContainer productName={props.name} productDate={props.date} expanded={isExpanded}/>
                </Pressable>
                {/* Offscreen TagContainer for initial measurement */}
                <View style={{position: 'absolute',
                    top: -1000, // Offscreen
                    opacity: 0,}} ref={offscreenRef}>
                    <TagContainer tagList={props.categories} />
                </View>

                {/* Visible TagContainer */}
                <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
                    <TagContainer tagList={props.categories} />
                </Animated.View>
            </View>
        </View>
    );
};

export default ProductItem;

const styles = StyleSheet.create({
    productContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: 'nowrap',
        flex: 1,

        backgroundColor: '#F8F9FC',
        borderRadius: 4,
        gap: 12,
        padding: 8,
        marginHorizontal: 16,
        overflow: "hidden",
        minHeight: 80,
        marginBottom: 12,

        shadowColor: '#1B2633',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3,

        elevation: 6,
    },
    imageContainer: {
        width: 85,
    },
    image: {
        height: null,
        maxHeight: 113,
        resizeMode: "contain",
        flex: 1,
        transform: "scale"
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    titleText: {
        flex: 1,
        color: "#1B2633",
        fontSize: 20,
        fontWeight: "900",
        fontFamily: "Roboto",
    },
    descriptionText: {
        color: "#1B2633",
        fontSize: 12,
        fontWeight: '400',
        fontFamily: "Roboto",
    },
    headerIcon: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tagContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 6,
    },
    tag: {
        borderRadius: 48,
        paddingHorizontal: 6,
        paddingVertical: 1,
        backgroundColor: "#D4E5FF"
    },
    tagText: {
        lineHeight: 13,
        color: "#1B2633",
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Roboto',
    },
    collapsed: {
        height: 0,
        opacity: 0,
    },
});