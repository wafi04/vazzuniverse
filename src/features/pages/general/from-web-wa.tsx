import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormConfigWebProps } from "./form-web-umum";

export function  FormWaMessage({ errors, formData, onChange }: FormConfigWebProps){
    return (
        <Card>
            <CardHeader>
            <CardTitle>Wa Message</CardTitle>
            <CardDescription>Wa Message</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kbrstore_api">KBR Store API</Label>
              <Input
                id="kbrstore_api"
                name="kbrstore_api"
                value={formData.kbrstore_api}
                onChange={onChange}
                className={errors.kbrstore_api ? 'border-red-500' : ''}
              />
              {errors.kbrstore_api && (
                <p className="text-sm text-red-500">{errors.kbrstore_api}</p>
              )}
            </div>
            </div>
            </CardContent>
        </Card>
    )
}