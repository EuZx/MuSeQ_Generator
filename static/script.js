document.addEventListener('DOMContentLoaded', function() {
    const lyricsInput = document.getElementById('lyrics-input');
    const generateLyricsButton = document.getElementById('generate-lyrics-button');
    const lyricsContainer = document.getElementById('lyrics-container');
    const musicContainer1 = document.getElementById('music-container-1');
    const musicDownloader1 = document.getElementById('music-downloader-1');

    async function query(data) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            {
                headers: { Authorization: "Bearer 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" },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.blob();
        return result;
    }

    async function fetchLyrics(text) {
        const response = await fetch('http://localhost:5000/generate_lyrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    generateLyricsButton.addEventListener('click', function() {
        const inputText = lyricsInput.value;
        if (inputText.trim() === '') {
            alert('Please input lyrics or some text!');
            return;
        }

        fetchLyrics(inputText)
            .then(data => {
                if(data.lyrics) {
                    // Display the generated lyrics
                    lyricsContainer.innerText = data.lyrics;
                } else {
                    throw new Error('No lyrics were generated.');
                }
            })
            .catch(error => {
                console.error('Error when generating lyrics:', error);
                alert('Error when generating lyrics');
            });

        query({"inputs": inputText})
            .then(response => {
                // Create a blob URL from the audio blob
                const audioURL = URL.createObjectURL(response);

                // Create an audio tag to play the music
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = audioURL;

                // Create a download link for the music
                const downloadLink = document.createElement('a');
                downloadLink.href = audioURL;
                downloadLink.download = "generated_music.mp3";
                downloadLink.innerText = "Download Music";

                // Clear previous contents and append the audio player and download link to the containers
                musicContainer1.innerHTML = '';
                musicContainer1.appendChild(audio);

                musicDownloader1.innerHTML = '';
                musicDownloader1.appendChild(downloadLink);
            })
            .catch(error => {
                console.error('Error when generating music:', error);
                alert('Error when generating music');
            });
    });
});



document.addEventListener('DOMContentLoaded', function () {
    const textInput = document.getElementById('text-input');
    const generateButton = document.getElementById('generate-button');
    const musicContainer2 = document.getElementById('music-container-2');
    const musicDownloader2 = document.getElementById('music-downloader-2');

    generateButton.addEventListener('click', function () {
        const inputText = textInput.value;
        if (inputText.trim() === '') {
            alert('Please input text of music attributes!');
            return;
        }

        // Update the API URL to the new ngrok URL
        const apiUrl = 'https://6e9a-2406-3003-2005-4370-f802-5163-11ef-a7a8.ngrok-free.app/generate?text=' + encodeURIComponent(inputText);

        fetch(apiUrl, { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob(); 
            })
            .then(musicBlob => {
                if (musicBlob.size > 0) {
                    // Create a MIDI URL from the blob
                    const midiURL = URL.createObjectURL(musicBlob);

                    // Get the midi-player element
                    const midiPlayer = document.getElementById('midi-player');

                    // Set the src of the midi-player to the Object URL
                    midiPlayer.src = midiURL;

                    // Clear the previous contents
                    musicContainer2.innerHTML = '';
                    // Append the midi-player to the container
                    musicContainer2.appendChild(midiPlayer);

                    // Create a download link for the MIDI
                    const downloadLink = document.createElement('a');
                    downloadLink.href = midiURL;
                    downloadLink.download = 'generated_music.mid'; // Ensure the file extension is .mid
                    downloadLink.innerText = 'Download MIDI';

                    // Clear the previous download link and append the new one
                    musicDownloader2.innerHTML = '';
                    musicDownloader2.appendChild(downloadLink);
                } else {
                    // Handle the case where an empty blob is returned
                    console.error('Received an empty music file.');
                    alert('Received an empty music file. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error when generating music:', error);
                alert('Error when generating music: ' + error.message);
            });
    });
});
