function extractId(url) {
        const regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        const match = url.match(regex);
        return (match && match[1].length === 11) ? match[1] : null;
    }

    async function startDownload() {
        const urlInput = document.getElementById('videoUrl').value.trim();
        const type = document.getElementById('formatType').value;
        const itagSelect = document.getElementById('videoQuality').value;
        const btn = document.getElementById('mainBtn');
        const status = document.getElementById('status');
        
        const videoId = extractId(urlInput);
        if (!videoId) { alert("Invalid URL"); return; }

        btn.disabled = true;
        btn.innerText = "Extracting...";
        status.innerText = "Contacting FAM OFC API...";

        try {
            // Step 1: Fetch the JSON response
            const apiUrl = `https://fam-official.serv00.net/api/ytapi.php?video=${videoId}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Step 2: Validate the response
            if (data.success && data.formats && data.formats.length > 0) {
                
                // Find the itag the user wants (default to 18 if not found)
                let targetFormat = data.formats.find(f => f.itag == itagSelect) || data.formats[0];

                status.innerText = "Link found! Starting download...";
                
                // Step 3: Use the real URL found in the JSON
                const realFileUrl = targetFormat.url;
                
                // Create a virtual link to trigger the browser download
                const a = document.createElement('a');
                a.href = realFileUrl;
                a.setAttribute('download', 'video.mp4');
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } else {
                status.innerText = "Error: No formats available for this video.";
            }
        } catch (error) {
            status.innerText = "Error fetching API data.";
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.innerText = "🚀 Download Now";
        }
    }
