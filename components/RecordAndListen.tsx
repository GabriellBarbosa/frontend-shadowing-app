import React from "react";
import { Audio } from "expo-av";
import { Button, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { playAudio, playFromUri } from "@/utils/functions";
import { SERVER_HOST } from "@/utils/constants";
import { Recording } from "@/interfaces/Recording";

export default function RecordAndListen(props: {
    index: number,
    audioName: string,
    chunkName: string,
    recordings: Array<Recording | null>,
    setRecordings: (arg: Array<Recording | null>) => void,
}) {
    const [recording, setRecording] = React.useState<Audio.Recording | undefined>(undefined);
    const audioPreset = Audio.RecordingOptionsPresets.HIGH_QUALITY;

    async function toggleRecording() {
        if (recording)
            await stopRecording(recording)
        else 
            await startRecording()
    }

    async function startRecording() {
        try {
            const recording = await tryToStartRecording();
            setRecording(recording);
        } catch(err) {
            setRecording(undefined);
        }

        async function tryToStartRecording() {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status == 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync(audioPreset);
                return recording;
            }
            return undefined;
        }
    }
    
    async function stopRecording(recording: Audio.Recording) {
        setRecording(undefined);

        await recording.stopAndUnloadAsync();
        await putIntoLocalRecordings();
        const uri = recording.getURI();
        if (uri) await saveNewRecording(uri);

        async function putIntoLocalRecordings() {
            const { sound } = await recording.createNewLoadedSoundAsync();
            const allRecordings = [...props.recordings];
            allRecordings[props.index] = sound;
            props.setRecordings(allRecordings);
        }

        async function saveNewRecording(recordingUri: string) {
            const blob = await fetch(recordingUri).then(r => r.blob())
            const b64 = await blobToBase64(blob)
            fetch(`${SERVER_HOST}/upload_recording/${props.audioName}?chunk_name=${props.chunkName}`, {
                method: 'POST',
                body: JSON.stringify({ b64 }),
                headers: { 'content-type': 'application/json' }
            }) .catch((err) => console.error(err.message))
        }

        function blobToBase64(blob: Blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };
    }

    async function playRecording(rec: Recording | null) {
        if (rec == null) 
            return;
        else if (rec instanceof Audio.Sound)
            await playAudio(rec);
        else
            await playFromUri(rec.path);
    }

    return (
        <View>
            {props.recordings[props.index] ? (
                <View style={styles.row}>
                    <Pressable
                        style={styles.listenBtn}
                        onPress={async () => playRecording(props.recordings[props.index])}
                    >
                        <Image 
                            style={styles.playAndPauseIcon} 
                            source={require('../assets/images/play-button.png')}
                            alt="play"
                        />
                    </Pressable>
                    <Pressable
                        style={styles.recordBtn}
                        onPress={async () => await toggleRecording()}
                    >
                        <Image
                            style={styles.recordIcon} 
                            source={require('../assets/images/microphone.png')}
                            alt="record"
                        />
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    style={styles.recordBtn}
                    onPress={async () => await toggleRecording()}
                >
                <Image
                    style={styles.recordIcon} 
                    source={require('../assets/images/microphone.png')}
                    alt="record"
                />
            </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        columnGap: 1,
    },
    listenBtn: {
        flex: 1,
        backgroundColor: '#246a73',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8
    },
    playAndPauseIcon: {
        width: 24,
        height: 24
    },
    recordBtn: {
        backgroundColor: '#246a73',
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordIcon: {
        width: 24,
        height: 24,
    }
})