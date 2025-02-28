import { router } from "expo-router";
import React, { useState } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Image } from "react-native";
import Svg, { Path } from "react-native-svg";

const FloatingButtons = () => {
  const [animation] = useState(new Animated.Value(0));

  const [isOpen, setIsOpen] = useState(false);

const toggleButtons = () => {
  setIsOpen(!isOpen);
  Animated.timing(animation, {
    toValue: isOpen ? 0 : 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
};


  const facebookStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100],
        }),
      },
    ],
  };

  const instagramStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.button, instagramStyle]}>
        <TouchableOpacity style={styles.buttonStyle} onPress={()=>router.push("/CameraScaanScreen")}>
          <Image
            source={{ uri: "https://img.icons8.com/ios/50/fingerprint-scan.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.button, facebookStyle]}>
        <TouchableOpacity style={styles.buttonStyle} onPress={()=>router.push("/AddProductScreen")}>
          <Image
            source={{ uri: "https://img.icons8.com/ios/50/hand-drag.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={[styles.buttonStyle, styles.shareButton]} onPress={toggleButtons}>
        <Svg width={40} height={40} viewBox="0 0 30 30">
          <Path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z" fill="#DC0654" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "85%", 
    left: "85%", 
    transform: [{ translateX: -25 }, { translateY: -25 }], 
    backgroundColor: "transparent",
  },
  button: {
    position: "absolute",
  },
  buttonStyle: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  shareButton: {
    backgroundColor: "#fbe6ed",
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default FloatingButtons;
