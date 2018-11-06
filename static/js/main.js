// Set up audio context
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        let isRecording = false;
    
        const audioContext = new AudioContext;
        const audioInLevel = audioContext.createGain();
        audioInLevel.gain.value = 1;
        const mixer = audioContext.createGain();
        let audioIn = void 0;
        audioInLevel.connect(mixer);
        mixer.connect(audioContext.destination);
        
        // Set up audioRecorder
        const audioRecorder = new WebAudioRecorder(mixer, {
            workerDir: 'js/'
        });
        audioRecorder.onComplete = function(recorder, blob) {
            console.log(blob);
            let f = new FileReader();
            f.onload = function() {
                const b64 = f.result;
                fetch('http://127.0.0.1:5000/playlist', {
                    method: 'POST',
                    body: JSON.stringify({audio: b64.slice(22)}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => {
                    console.log(res);
                })
            }
            // let url = URL.createObjectURL(blob);
            f.readAsDataURL(blob);
            // document.getElementById('audio').src = url;
        }
        document.getElementById('record').addEventListener('click', function(e) {
            // Start Recording
            if (!isRecording) {
                e.target.innerText = 'Stop Recording'
                audioRecorder.setOptions({
                    timeLimit: 3, // seconds
                    // encodeAfterRecord: encodingProcess === 'separate',
                    progressInterval: 1, // seconds
                });
                audioRecorder.startRecording();
            } else {
                e.target.innerText = 'Start Recording'
                audioRecorder.finishRecording();
            }
            isRecording = !isRecording;
        })

        // Ask for mic permissions
        navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(stream => {
            audioIn = audioContext.createMediaStreamSource(stream);
            audioIn.connect(audioInLevel);
        })
    })
})()