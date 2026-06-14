import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import WizardShell from '@/components/layout/WizardShell'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import useStore from '@/stores/useStore'

const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical',
  'Country', 'Alternative', 'Folk', 'Indie', 'Hindi', 'Lofi',
]

export default function GenreStep() {
  const navigate = useNavigate()
  const { selectedGenres, toggleGenre } = useStore()

  return (
    <WizardShell
      step={1}
      title="Pick your genres"
      subtitle="What should the sound lean into?"
      footer={
        <>
          <Button variant="ghost" onClick={() => navigate('/create/mood')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={() => navigate('/create/sliders')}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        {GENRES.map((g) => (
          <Chip
            key={g}
            selected={selectedGenres.includes(g)}
            onClick={() => toggleGenre(g)}
            className="px-4 py-2.5"
          >
            {g}
          </Chip>
        ))}
      </div>
    </WizardShell>
  )
}
