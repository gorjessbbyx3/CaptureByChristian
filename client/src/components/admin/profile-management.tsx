import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Camera, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Save,
  Edit,
  Instagram,
  Facebook,
  Youtube,
  Loader2
} from "lucide-react";

interface ProfileData {
  id: number;
  name: string;
  title: string;
  bio: string;
  phone: string;
  email: string;
  address: string;
  headshot: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
}

export function ProfileManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
    // Fetch profile data from API
    const { data: profile, isLoading } = useQuery({
      queryKey: ["/api/profile"],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/profile");
        return response.json();
      }
    });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize profile data when loaded
  React.useEffect(() => {
    if (profile && !profileData) {
      setProfileData(profile);
    }
  }, [profile, profileData]);

  const handleHeadshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        setProfileData(prev => prev ? ({
          ...prev,
          headshot: base64
        }) : null);

        toast({
          title: "Headshot Updated",
          description: "Your profile photo has been updated. Don't forget to save your changes!",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;
    updateProfileMutation.mutate(profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (!profileData) return;
    
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setProfileData(prev => prev ? ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }) : null);
    } else {
      setProfileData(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  };

  if (isLoading || !profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Management</h2>
          <p className="text-muted-foreground">
            Manage your profile information, headshot, and contact details displayed on the website
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Profile Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={profileData?.headshot || profile?.headshot || ''}
                  alt="Profile headshot"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className="space-y-3">
                <Label htmlFor="headshot-upload">Upload New Photo</Label>
                <Input
                  id="headshot-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Max file size: 50MB. Recommended: Square image, 800x800px or larger
                </p>
              </div>
            )}

            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Used on Homepage About Section
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData?.name || profile?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profileData?.name || profile?.name || ''}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={profileData?.title || profile?.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{profileData?.title || profile?.title || ''}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profileData?.bio || profile?.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell your story..."
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm leading-relaxed">{profileData?.bio || profile?.bio || ''}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profileData?.phone || profile?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.phone || profile?.phone || ''}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData?.email || profile?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.email || profile?.email || ''}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={profileData?.address || profile?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.address || profile?.address || ''}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Badge variant="outline" className="text-xs">
                Displayed in Contact Section
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Instagram className="h-5 w-5" />
              <span>Social Media</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                {isEditing ? (
                  <Input
                    id="instagram"
                    value={profileData?.socialMedia?.instagram || profile?.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    placeholder="@username"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData?.socialMedia?.instagram || profile?.socialMedia?.instagram || ''}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                {isEditing ? (
                  <Input
                    id="facebook"
                    value={profileData?.socialMedia?.facebook || profile?.socialMedia?.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    placeholder="Page name"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData?.socialMedia?.facebook || profile?.socialMedia?.facebook || ''}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                {isEditing ? (
                  <Input
                    id="youtube"
                    value={profileData?.socialMedia?.youtube || profile?.socialMedia?.youtube || ''}
                    onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                    placeholder="Channel name"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-muted-foreground rounded-md">
                    <Youtube className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData?.socialMedia?.youtube || profile?.socialMedia?.youtube || ''}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Badge variant="outline" className="text-xs">
                Used in Footer and Contact Section
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}