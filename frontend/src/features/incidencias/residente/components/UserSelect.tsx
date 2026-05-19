
//Icons
import { User } from "lucide-react";

//Components UI
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldError as CustomFieldError } from '@/components/ui/field-error';
import { useAuth } from "@/features/auth/hooks/useAuth";

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function UserSelect({ value, onChange, error }: UserSelectProps) {
  const user = useAuth((state) => state.user);
  const userName = user?.nombre || "Usuario";

  return (
    <Field>
      <FieldLabel>Usuario</FieldLabel>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Selecciona tu usuario" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Usuario</SelectLabel>

            <SelectItem value="user" className="cursor-pointer">
              <Avatar size="sm">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
                <AvatarFallback>MP</AvatarFallback>
              </Avatar>
              {userName}
            </SelectItem>

            <SelectItem value="anonimo" className="cursor-pointer">
              <Avatar size="sm">
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              Usuario anónimo
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <CustomFieldError className="text-xs mt-0" error={error} />
    </Field>
  );
}
