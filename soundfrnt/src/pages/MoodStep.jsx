import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import WizardShell from '@/components/layout/WizardShell'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import useStore from '@/stores/useStore'

const MOODS = [
  { label: 'Happy', icon: '😊' },
  { label: 'Sad', icon: '😔' },
  { label: 'Excited', icon: '⚡' },
  { label: 'Calm', icon: '🌿' },
  { label: 'Energetic', icon: '🔥' },
  { label: 'Reflective', icon: '🌙' },
]

export default function MoodStep() {
  const navigate = useNavigate()
  const { selectedMoods, toggleMood } = useStore()

  return (
    <WizardShell
      step={0}
      title="How are you feeling?"
      subtitle="Pick the moods that fit — choose as many as you like, or skip ahead."
      footer={
        <>
          <Button variant="ghost" onClick={() => navigate('/choice')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={() => navigate('/create/genre')}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-3">
        {MOODS.map((m) => (
          <Chip
            key={m.label}
            icon={m.icon}
            selected={selectedMoods.includes(m.label)}
            onClick={() => toggleMood(m.label)}
            className="px-5 py-3 text-body"
          >
            {m.label}
          </Chip>
        ))}
      </div>
    </WizardShell>
  )
}
