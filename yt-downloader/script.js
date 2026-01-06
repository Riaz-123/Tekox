function toggleQuality() {
        const type = document.getElementById('formatType').value;
        document.getElementById('quality-wrapper').style.display = (type === 'video') ? 'block' : 'none';
    }

    function extractId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    function startDownload() {
        const urlInput = document.getElementById('videoUrl').value;
        const type = document.getElementById('formatType').value;
        const itag = document.getElementById('videoQuality').value;
        const videoId = extractId(urlInput);

        if (!videoId) {
            alert("⚠️ Please paste a valid YouTube URL first!");
            return;
        }

        // Construct Direct API URL
        let downloadLink = `https://fam-official.serv00.net/api/ytapi.php?video=${videoId}`;
        
        if (type === 'audio') {
            downloadLink += `&type=audio&itag=140`;
        } else {
            downloadLink += `&type=video&itag=${itag}`;
        }

        // Redirect user directly to the API download stream
        window.location.href = downloadLink;
    }
