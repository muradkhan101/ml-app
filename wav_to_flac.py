from pydub import AudioSegment

def convertWavToFlac(fileName, outputName):
    sound = AudioSegment.from_wav(fileName)
    sound.export(outputName, format='flac', parameters=['-ac', '1'])