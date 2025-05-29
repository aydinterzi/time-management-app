import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
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
  onStart?: () => void;
  onReset?: () => void;
}

export default function Timer({ onComplete, onStart, onReset }: TimerProps) {
  // Force dark theme
  const isDark = true;

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

  // Store the timestamp when the timer started or was last resumed
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);

  // Handle timer interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timeRemaining whenever duration changes
  useEffect(() => {
    if (state === "idle") {
      setTimeRemaining(duration);
    }
  }, [duration, state, setTimeRemaining]);

  // Start/pause timer effect
  useEffect(() => {
    if (state === "running") {
      // Set the start timestamp when the timer starts running
      if (startTimestamp === null) {
        setStartTimestamp(Date.now());
      }

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Create new interval
      intervalRef.current = setInterval(() => {
        // Calculate elapsed time based on the difference between now and the start timestamp
        const now = Date.now();
        const elapsedSeconds = Math.floor(
          (now - (startTimestamp as number)) / 1000
        );
        const newTimeRemaining = Math.max(0, duration - elapsedSeconds);

        if (newTimeRemaining <= 0) {
          // Timer complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setTimeRemaining(0);
          setStartTimestamp(null);

          // Call completion handler before setting state to completed
          onComplete?.();
          complete();

          // Trigger haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Update time remaining
          setTimeRemaining(newTimeRemaining);
        }
      }, 1000); // Update every second for better performance
    } else if (state === "paused") {
      // When paused, store the current timeRemaining but clear the startTimestamp
      setStartTimestamp(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else if (state === "idle") {
      // Reset the timestamp when idle
      setStartTimestamp(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, duration, startTimestamp, setTimeRemaining, complete, onComplete]);

  // Update startTimestamp when resuming from pause
  useEffect(() => {
    if (state === "running" && startTimestamp === null) {
      // Calculate what the start timestamp should be based on the current time remaining
      const now = Date.now();
      const adjustedStartTime = now - (duration - timeRemaining) * 1000;
      setStartTimestamp(adjustedStartTime);
    }
  }, [state, startTimestamp, timeRemaining, duration]);

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
      if (onStart) {
        onStart(); // This will handle both session tracking and timer start
      } else {
        start();
        setStartTimestamp(Date.now());
      }
    } else if (state === "running") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      pause();
    } else if (state === "paused") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // When resuming, adjust the start timestamp based on the time that's already elapsed
      const now = Date.now();
      const adjustedStartTime = now - (duration - timeRemaining) * 1000;
      setStartTimestamp(adjustedStartTime);
      resume();
    }
  };

  // Handle reset button press
  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartTimestamp(null);
    if (onReset) {
      onReset(); // This will handle session cleanup and timer reset
    } else {
      reset();
    }
  };

  // Determine which button to show
  const buttonText =
    state === "running" ? "Pause" : state === "paused" ? "Resume" : "Start";
  const timerColor = getTimerColor();

  // Calculate the percentage remaining for the progress indicator
  const progressValue = state === "idle" ? duration : timeRemaining;
  const progressMax = duration;

  return (
    <View style={styles.container}>
      <Text
        style={[styles.timerType, isDark ? styles.darkText : styles.lightText]}
      >
        {type === "work"
          ? "Focus Time"
          : type === "short_break"
          ? "Short Break"
          : "Long Break"}
      </Text>

      <CircularProgress
        value={progressValue}
        maxValue={progressMax}
        radius={120}
        activeStrokeWidth={15}
        inActiveStrokeWidth={15}
        activeStrokeColor={timerColor}
        inActiveStrokeColor={isDark ? "#2d2d2d" : "#d0d0d0"}
        title={formatTime(timeRemaining)}
        titleColor={isDark ? "#fff" : "#333"}
        titleStyle={{ fontSize: 36, fontWeight: "bold" }}
        showProgressValue={false}
        key={`timer-${type}-${duration}`}
      />

      <View style={styles.buttonContainer}>
        {state === "completed" ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: timerColor }]}
            onPress={handlePlayPause}
          >
            <Text style={styles.buttonText}>Start Next Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: timerColor }]}
            onPress={handlePlayPause}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}

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
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#333",
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
