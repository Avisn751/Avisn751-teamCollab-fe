import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import useToastStore from '@/stores/toastStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Settings as SettingsIcon, User, Lock, Camera, Loader2, Check, AlertCircle, Pencil } from 'lucide-react'
import { authApi } from '@/services/api'

export default function Settings() {
  const { user, updateProfileImage, changePassword, setUser, isLoading, error, clearError } = useAuthStore()
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToastStore()

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name)
    }
  }, [user])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => toast.showToast(message, type)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      await changePassword(
        passwordForm.currentPassword || undefined,
        passwordForm.newPassword
      )
      closePasswordDialog()
      showSuccess('Password changed successfully!')
    } catch {
      setLocalError('Failed to change password')
    }
  }

  const handleImageUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim() && !imageFile) return

    setIsSaving(true)
    try {
      // If a file is provided, convert to base64 data URL
      if (imageFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
        await updateProfileImage(dataUrl)
      } else {
        await updateProfileImage(imageUrl)
      }

      closeImageDialog()
      showSuccess('Profile image updated!')
      showToast('Profile image uploaded', 'success')
    } catch (err) {
      console.error(err)
      setLocalError('Failed to update profile image')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (file?: File) => {
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsSaving(true)
    try {
      const response = await authApi.updateProfile({ name: newName.trim() })
      setUser(response.data.data)
      closeNameDialog()
      showSuccess('Name updated successfully!')
    } catch {
      setLocalError('Failed to update name')
    } finally {
      setIsSaving(false)
    }
  }

  const closePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setLocalError('')
    clearError()
  }

  const closeImageDialog = () => {
    setIsImageDialogOpen(false)
    setImageUrl('')
    setLocalError('')
    clearError()
  }

  const closeNameDialog = () => {
    setIsNameDialogOpen(false)
    setNewName(user?.name || '')
    setLocalError('')
    clearError()
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/25">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border-2 border-green-500/20 text-green-600 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <div className="grid gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  {user?.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user?.name} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsImageDialogOpen(true)}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <button
                    onClick={() => setIsNameDialogOpen(true)}
                    className="p-1 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">Role: {user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsPasswordDialogOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            {user?.isInvitedUser && (
              <p className="text-sm text-muted-foreground mt-4">
                You were invited to this team. We recommend changing your temporary password.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => !open && closePasswordDialog()}>
        <DialogContent onClose={closePasswordDialog}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              {(localError || error) && (
                <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {localError || error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password (if set)"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if you're using a temporary password
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePasswordDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !passwordForm.newPassword || !passwordForm.confirmPassword}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Profile Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={(open) => !open && closeImageDialog()}>
        <DialogContent onClose={closeImageDialog}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Update Profile Image
            </DialogTitle>
            <DialogDescription>
              Upload an image file or provide an image URL. Files will be sent as base64.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImageUpdate}>
            <div className="space-y-4">
              {localError && (
                <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {localError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="imageFile">Upload Image File</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  className="block w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Or Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/your-image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    if (e.target.value) {
                      setImageFile(null)
                      setImagePreview(e.target.value)
                    }
                  }}
                />
              </div>

              {(imagePreview || imageUrl) && (
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                    <AvatarImage src={imagePreview || imageUrl} alt="Preview" />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeImageDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !imageUrl.trim()}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Updating...' : 'Update Image'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={(open) => !open && closeNameDialog()}>
        <DialogContent onClose={closeNameDialog}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Update Name
            </DialogTitle>
            <DialogDescription>
              Change your display name
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNameUpdate}>
            <div className="space-y-4">
              {localError && (
                <div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {localError}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="newName">Name</Label>
                <Input
                  id="newName"
                  type="text"
                  placeholder="Enter your name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeNameDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !newName.trim()}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
