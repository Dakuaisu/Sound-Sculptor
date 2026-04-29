export default function About() {
  return (
    <div className="container">
      <div className="about-container">
        <h1>About Sound Sculptor</h1>
        <p>
          Sound Sculptor is a web application that helps you create personalized
          playlists based on your mood and music preferences. Whether you want to
          fine-tune every detail or let AI do the work, we have you covered.
        </p>
        <p>
          <strong>How it works:</strong>
        </p>
        <ul>
          <li>Connect your Spotify account</li>
          <li>Choose your mood, genres, and audio preferences</li>
          <li>Our ML model recommends tracks tailored to your taste</li>
          <li>Or describe a vibe and let AI generate a playlist for you</li>
          <li>Save your new playlist directly to Spotify</li>
        </ul>
        <p>
          Built with React, Flask, scikit-learn, and the Spotify Web API.
        </p>
      </div>
    </div>
  )
}
