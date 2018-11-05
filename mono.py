import base64
# from scipy.io import wavfile
import librosa

def convertB64ToMonoAndSave(b64, output):
    if type(b64) is str:
        b64 = b64.encode()
    try:
        bytes = base64.decodebytes(b64)
    except:
        bytes = base64.decodebytes(b64 + '===')
    writer = open(output, 'wb')
    writer.write(bytes)
    writer.close()
    # rate, sound = wavfile.read(output)
    # data = sound[:, 0] / 2 + sound[:, 1] / 2
    # wavfile.write(output, rate, data)
    sound, rate = librosa.load(output, mono=True)
    librosa.output.write_wav(output, sound, rate)
