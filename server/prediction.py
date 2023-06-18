from pandas import array
import tensorflow as tf
import numpy as np
import sys

def make_prediction(model, pre_array):
    #print("\n\nModel Predictions:\n")
    prediction = model.predict(pre_array)
    #print(prediction)
    for i in range(len(pre_array)):
        print(class_names[np.argmax(prediction[i])])

class_names = ['None', 'Light Rain', 'Moderate Rain', 'Heavy Rain', 'Violent Rain']

arr = np.array([sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7],])

desired_array = [float(numeric_string) for numeric_string in arr]

prediction_array = np.array([
    desired_array
])
model = tf.keras.models.load_model(r'D:\DoAn-IoT-Group9\weather_station_71_36.h5')

make_prediction(model, prediction_array)