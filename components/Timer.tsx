import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useTimerStore } from "../stores/timerStore";

// Format seconds into MM:SS display
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

interface TimerProps {
  onComplete?: () => void;
}

export default function Timer({ onComplete }: TimerProps) {
  const {
    state,
    type,
    duration,
    timeRemaining,
    setTimeRemaining,
    start,
    pause,
    resume,
    reset,
    complete,
  } = useTimerStore();

  // Handle timer interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress value for circular indicator (0-100)
  const progress = (timeRemaining / duration) * 100;

  // Start/pause timer effect
  useEffect(() => {
    if (state === "running") {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Create new interval
      intervalRef.current = setInterval(() => {
        if (timeRemaining <= 1) {
          // Timer complete
          clearInterval(intervalRef.current!);
          setTimeRemaining(0);
          onComplete?.();
          complete();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Decrement time remaining
          setTimeRemaining(timeRemaining - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      // Clear interval when not running
      clearInterval(intervalRef.current);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, timeRemaining, setTimeRemaining, complete, onComplete]);

  // Generate timer color based on type
  const getTimerColor = () => {
    switch (type) {
      case "work":
        return "#ff5252"; // Red for work sessions
      case "short_break":
        return "#4caf50"; // Green for short breaks
      case "long_break":
        return "#2196f3"; // Blue for long breaks
      default:
        return "#ff5252";
    }
  };

  // Handle play/pause button press
  const handlePlayPause = () => {
    if (state === "idle") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      start();
    } else if (state === "running") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      pause();
    } else if (state === "paused") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      resume();
    }
  };

  // Handle reset button press
  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
  };

  // Determine which button to show
  const buttonText =
    state === "running" ? "Pause" : state === "paused" ? "Resume" : "Start";
  const timerColor = getTimerColor();

  return (
    <View style={styles.container}>
      <Text style={styles.timerType}>
        {type === "work"
          ? "Focus Time"
          : type === "short_break"
          ? "Short Break"
          : "Long Break"}
      </Text>

      <CircularProgress
        value={timeRemaining}
        maxValue={duration}
        radius={120}
        activeStrokeWidth={15}
        inActiveStrokeWidth={15}
        activeStrokeColor={timerColor}
        inActiveStrokeColor={"#2d2d2d"}
        title={formatTime(timeRemaining)}
        titleColor="#fff"
        titleStyle={{ fontSize: 36, fontWeight: "bold" }}
        showProgressValue={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: timerColor }]}
          onPress={handlePlayPause}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>

        {(state === "paused" || state === "completed") && (
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  timerType: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  resetButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
