import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Camera, Templates, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor, useMicrophonePermission } from 'react-native-vision-camera';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const MyComponent: React.FC = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isPhoto, setIsPhoto] = useState(false)
  const [isVideo, setIsVideo] = useState(true)
  const [isAudio, setIsAudio] = useState(true)

  const camera = useRef<Camera>(null)

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No permission</Text>
        <Button title="Request permission" onPress={requestPermission} />
      </View>
    );
  }

  const device = useCameraDevice('back')
  if (device == null) return <Text>No Camera Found</Text>;

  const format = useCameraFormat(device, [
    { photoResolution: 'max' }
  ])


  // const format = useCameraFormat(device, Templates.Instagram)

  const takePhoto = async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!')

      console.log('Taking photo...')
      const file = await camera.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
        enableShutterSound: true
      });
      const result = await fetch(`file://${file.path}`)
      const data = await result.blob();

      console.log('Photo taken!', file, data);

      await CameraRoll.saveAsset(`file://${file.path}`, {
        type: 'photo',
      })

    } catch (e) {
      console.error('Failed to take photo!', e)
    }
  }

  const takeVideo = async () => {
    // setIsPhoto(false);
    setIsVideo(true);
    setIsAudio(true);
    try {
      if (camera.current == null) throw new Error('Camera ref is null!')

      console.log('Taking video...')
      const file = await camera.current.startRecording({

        onRecordingFinished: async (video) => {
          const path = video.path
          await CameraRoll.saveAsset(`file://${path}`, {
            type: 'video',
          })
        }, onRecordingError: (error) => console.error(error)
      });

    } catch (e) {
      console.error('Failed to take video!', e)
    }
  }

  const stopVideo = async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!')

      console.log('Stopping video...')
      await camera.current.stopRecording();
    } catch (e) {
      console.error('Failed to stop video!', e)
    }
  }

  return (
    <>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        photo={true}
        video={true}
        audio={true}
      />
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Take Video" onPress={takeVideo} />
      <Button title="Stop Video" onPress={stopVideo} />
    </>
  );
};

export default MyComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});