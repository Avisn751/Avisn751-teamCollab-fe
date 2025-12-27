import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, FolderKanban, CheckCircle, XCircle } from 'lucide-react'
import { authApi } from '@/services/api'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await authApi.verifyEmail({ token })
        if (response.data.success) {
          setIsVerified(true)
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Failed to verify email. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <FolderKanban className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {isLoading
              ? 'Verifying Email...'
              : isVerified
              ? 'Email Verified!'
              : 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-base">
            {isLoading
              ? 'Please wait while we verify your email address'
              : isVerified
              ? 'Your email has been successfully verified'
              : 'There was an issue verifying your email'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {isLoading && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {isVerified && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {error && !isLoading && !isVerified && (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {isVerified && (
            <p className="text-center text-sm text-muted-foreground">
              Redirecting you to login in a moment...
            </p>
          )}
        </CardContent>

        {!isLoading && error && (
          <CardFooter>
            <Button
              onClick={() => navigate('/register')}
              className="w-full"
              variant="outline"
            >
              Back to Register
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
