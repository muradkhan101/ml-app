from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences

import pandas as pd
import numpy as np

import pickle

modelPath = 'sentiments/model.hdf5'
tokenizerPath = 'sentiments/tokenizer.pickle'
print('[INFO] Loading model')
model = load_model(modelPath)
print('[INFO] Loading tokenizer')
tokenizer = pickle.load(open(tokenizerPath, 'rb'))

model._make_predict_function()
print('[INFO] Sentiment model loaded')

def classifySentiment(input):
    tokens = tokenizer.texts_to_sequences(input.split(' '))
    words = []
    for tokenList in tokens:
        for token in tokenList:
            words.append(token)
    tokens = pad_sequences([words], maxlen=45)
    tokens = tokens[:45]

    prediction = model.predict(tokens)[0][0]

    print('[INFO] Prediction', prediction)

    if (prediction < 0.45):
        return 'negative'
    elif (prediction > 0.7):
        return 'positive'
    else:
        return 'neutral'
