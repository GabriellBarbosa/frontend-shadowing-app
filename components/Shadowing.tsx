import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Sound from "@/interfaces/Sound";
import RecordAndListen from "./RecordAndListen";
import ProgressBar from "./ProgressBar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlayingContext } from "@/contexts/PlayingContext";
import { Audio } from "expo-av";

interface Props {
    original: Sound;
    index: number;
    audioName: string;
}

export default function Shadowing(props: Props) {
    const { originalSounds, setPlayingSound } = React.useContext(PlayingContext);

    async function playFromUri(uri: string) {
        if (props.original.sound) {
            setPlayingSound({...props.original, sound: props.original.sound})
        } else {
            const sound = new Audio.Sound();
            await sound.loadAsync({uri});
            setPlayingSound({...props.original, sound})
        }
    }

    return (
        <View style={styles.shadowing}>
            <Text style={styles.message}>{props.index + 1} of {originalSounds.length}</Text>
            <Pressable
                style={styles.nativeSpeechBtn}
                onPress={async () => {
                    await playFromUri(props.original?.uri)
                }}
            >
                <Ionicons
                    name={originalSounds[props.index].isPlaying ? 'pause-circle' : 'play-circle'}
                    size={36} 
                    color="#ccc" 
                />
            </Pressable>
            <View style={styles.recordingBtnsWrapper}>
                <RecordAndListen
                    index={props.index} 
                    audioName={props.audioName}
                    chunkName={props.original.name}
                />
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    nativeSpeechBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        width: 220,
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: '#343a40',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8
    },
    recordingBtnsWrapper: {
        width: 260,
        alignSelf: 'flex-end'
    },
    shadowing: {
        alignItems: 'flex-start',
    },
    message: {
        marginTop: 10,
        padding: 10,
        color: '#ccc',
        backgroundColor: '#343a40',
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8
    },
})