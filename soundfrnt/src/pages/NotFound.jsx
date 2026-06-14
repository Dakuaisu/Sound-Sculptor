import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={Compass}
        title="This track doesn't exist"
        description="The page you're looking for drifted off the playlist. Let's get you back."
        action={<Button onClick={() => navigate('/')}>Back to home</Button>}
      />
    </div>
  )
}
