export async function sendMessage(message) {
    const response = await fetch(
        "http://localhost:3000/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to send message."
        );
    }

    return data;
}