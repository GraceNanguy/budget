import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Receipt, PiggyBank } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  onAction: () => void
  actionLabel?: string
}

export function EmptyState({ title, description, onAction, actionLabel = "Ajouter une transaction" }: EmptyStateProps) {
  return (
    <Card className="w-full border-dashed">
      <CardContent className="pt-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <PiggyBank className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-1" size="sm">
            <PlusCircle className="h-4 w-4" />
            Ajouter un revenu
          </Button>
          <Button className="gap-1" size="sm">
            <Receipt className="h-4 w-4" />
            Ajouter une dépense
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
