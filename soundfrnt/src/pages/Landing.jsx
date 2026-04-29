import { useNavigate } from 'react-router-dom'
import notes from '@/images/notes.png'
import notes1 from '@/images/notes1.png'
import notes2 from '@/images/notes2.png'
import notes3 from '@/images/notes3.png'
import notes4 from '@/images/notes4.png'
import notes5 from '@/images/notes5.png'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <img className="i n1" src={notes} alt="" />
      <img className="i n2" src={notes1} alt="" />
      <img className="i n3" src={notes2} alt="" />
      <img className="i n4" src={notes3} alt="" />
      <img className="i n5" src={notes4} alt="" />
      <img className="i n6" src={notes5} alt="" />

      <section className="section__container">
        <h3>Find the perfect playlist</h3>
        <h1>SCULPT YOUR</h1>
        <h2>PLAYLIST</h2>
        <div className="button-container">
          <button onClick={() => navigate('/connect')}>
            <span>Sculpt your playlist</span>
            <span>
              <i className="ri-music-2-line"></i>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
