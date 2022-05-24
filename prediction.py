from pandas import array
import tensorflow as tf
import numpy as np
import sys

def make_prediction(model, pre_array):
    #print("\n\nModel Predictions:\n")
    prediction = model.predict(pre_array)
    for i in range(len(pre_array)):
        print(class_names[np.argmax(prediction[i])])

class_names = ['None', 'Light Rain', 'Moderate Rain', 'Heavy Rain', 'Violent Rain']

#arr = [0, 0, 0.31819805, 0.31819805, 0.6988, 0.81498571, 0.99349753]
#arr = ['0', '0', '0.31819805', '0.31819805', '0.6988', '0.81498571', '0.99349753']
arr = np.array([sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7],])

desired_array = [float(numeric_string) for numeric_string in arr]

prediction_array = np.array([
    desired_array
])

#print(prediction_array)

model = tf.keras.models.load_model(r'D:\DoAnIOT\weather_station_71_36.h5')

# Check its architecture
#model.summary()

# Prediction Results:
make_prediction(model, prediction_array)