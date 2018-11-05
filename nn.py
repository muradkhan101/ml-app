import emotion.classify_func as sound
import sentiments.classify_func as sentiment
import gcloud

def getSoundInfo(flacFile, wavFile):
    speechText = gcloud.speechToText(flacFile)

    sentiments = sentiment.classifySentiment(speechText)
    print('Sentiment from sound:', sentiments)

    emotionLabel = sound.classifyEmotion(wavFile)
    print('Label from sound:', emotionLabel)
    return sentiments, emotionLabel
