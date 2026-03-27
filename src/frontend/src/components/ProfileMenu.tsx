import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export function ProfileMenu() {
  const { user, isGuest, signOut, playAsGuest } = useAuth();

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={playAsGuest}
        className="gap-1.5"
        data-ocid="profile.login.button"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/20 transition-colors outline-none"
          data-ocid="profile.open_modal_button"
        >
          <Avatar className="w-7 h-7">
            {user.photoURL && (
              <AvatarImage src={user.photoURL} alt={user.displayName ?? ""} />
            )}
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
            {isGuest ? "Guest" : (user.displayName ?? user.email)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        data-ocid="profile.dropdown_menu"
      >
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold truncate">
              {isGuest ? "Guest Player" : (user.displayName ?? "Player")}
            </span>
          </div>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate pl-5.5">
              {user.email}
            </p>
          )}
          {isGuest && (
            <p className="text-xs text-muted-foreground pl-5.5">
              Playing as guest
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive gap-2 cursor-pointer"
          data-ocid="profile.signout.button"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isGuest ? "Exit Guest Mode" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
