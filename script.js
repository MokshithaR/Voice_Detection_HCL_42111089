document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const replayButton = document.getElementById('replayButton');
    const downloadButton = document.getElementById('downloadButton');
    const emotionDiv = document.getElementById('emotion');
    const historyDiv = document.getElementById('history');
    const emotionGraph = document.getElementById('emotionGraph');
    
    let mediaRecorder, audioChunks = [], audioURL, audioBlob, emotionHistory = [];

    startButton.addEventListener('click', () => {
        startButton.disabled = true;
        stopButton.disabled = false;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    audioURL = URL.createObjectURL(audioBlob);
                    replayButton.disabled = false;
                    downloadButton.disabled = false;
                    analyzeAudio(audioBlob);
                };

                mediaRecorder.start();
            })
            .catch(error => {
                console.error('Error accessing audio:', error);
                startButton.disabled = false;
                stopButton.disabled = true;
            });
    });

    stopButton.addEventListener('click', () => {
        if (mediaRecorder) mediaRecorder.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
    });

    replayButton.addEventListener('click', () => {
        const audio = new Audio(audioURL);
        audio.play();
    });

    downloadButton.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = audioURL;
        a.download = 'recorded-audio.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    function analyzeAudio(audioBlob) {
        emotionDiv.textContent = 'Emotion: Analyzing...';
        setTimeout(() => {
            const emotions = ['Happy', 'Sad', 'Angry', 'Neutral'];
            const emotionIntensity = Math.random() * 100;
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            emotionDiv.textContent = `Emotion: ${randomEmotion} (Intensity: ${emotionIntensity.toFixed(1)}%)`;
            addToHistory(randomEmotion, emotionIntensity);
            plotEmotionGraph(randomEmotion, emotionIntensity);
        }, 2000);
    }

    function addToHistory(emotion, intensity) {
        const newItem = document.createElement('div');
        newItem.classList.add('emotionHistoryItem');
        newItem.textContent = `Emotion: ${emotion}, Intensity: ${intensity.toFixed(1)}%`;
        historyDiv.appendChild(newItem);
        emotionHistory.push({ emotion, intensity });
        
        // Limit history to last 5 entries
        if (emotionHistory.length > 5) {
            historyDiv.removeChild(historyDiv.firstChild);
        }
    }

    function plotEmotionGraph(emotion, intensity) {
        emotionGraph.style.display = 'block';
        const ctx = emotionGraph.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Intensity'],
                datasets: [{
                    label: emotion,
                    data: [intensity],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100 },
                    x: { display: false } // Hide x-axis labels
                },
                plugins: {
                    legend: { display: false } // Hide legend
                }
            }
        });
    }
});
