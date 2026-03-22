import librosa
import numpy as np
from scipy.ndimage import maximum_filter, binary_erosion
import hashlib

# Configuration for fingerprinting
FS = 22050
WINDOW_SIZE = 2048
HOP_SIZE = 512
DEFAULT_FAN_VALUE = 15
DEFAULT_MIN_HASH_TIME_DELTA = 0
DEFAULT_MAX_HASH_TIME_DELTA = 200
PEAK_NEIGHBORHOOD_SIZE = 20
MIN_AMPLITUDE = 10

def get_2d_peaks(arr2d, amp_min=MIN_AMPLITUDE):
    struct = np.ones((PEAK_NEIGHBORHOOD_SIZE, PEAK_NEIGHBORHOOD_SIZE))
    local_max = maximum_filter(arr2d, footprint=struct) == arr2d
    background = (arr2d == 0)
    eroded_background = binary_erosion(background, structure=struct, border_value=1)
    detected_peaks = local_max ^ eroded_background
    amps = arr2d[detected_peaks]
    j, i = np.where(detected_peaks)
    amps = amps.flatten()
    peaks = list(zip(i, j, amps))
    peaks_filtered = [x for x in peaks if x[2] > amp_min]
    return peaks_filtered

def generate_hashes(peaks, fan_value=DEFAULT_FAN_VALUE):
    peaks = sorted(peaks, key=lambda x: x[0])
    hashes = []
    for i in range(len(peaks)):
        for j in range(1, fan_value):
            if (i + j) < len(peaks):
                freq1 = peaks[i][1]
                freq2 = peaks[i + j][1]
                t1 = peaks[i][0]
                t2 = peaks[i + j][0]
                t_delta = t2 - t1

                if DEFAULT_MIN_HASH_TIME_DELTA <= t_delta <= DEFAULT_MAX_HASH_TIME_DELTA:
                    h = hashlib.sha1(f"{freq1}|{freq2}|{t_delta}".encode('utf-8'))
                    hashes.append((h.hexdigest()[:20], t1))
    return hashes

def fingerprint_audio(y, sr=FS):
    S = np.abs(librosa.stft(y, n_fft=WINDOW_SIZE, hop_length=HOP_SIZE))
    peaks = get_2d_peaks(S, amp_min=MIN_AMPLITUDE)
    hashes = generate_hashes(peaks)
    return hashes
