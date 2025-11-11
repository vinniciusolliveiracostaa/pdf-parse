import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export type StatCard = {
  title: string
  value: string | number
  description: string
  trend?: {
    value: string
    isUp: boolean
  }
  footer?: {
    label: string
    description: string
  }
}

interface SectionCardsProps {
  cards: StatCard[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const TrendIcon = card.trend?.isUp ? IconTrendingUp : IconTrendingDown
        return (
          <Card key={card.title} className="@container/card">
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              {card.trend && (
                <CardAction>
                  <Badge variant="outline">
                    <TrendIcon />
                    {card.trend.value}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            {card.footer && (
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {card.footer.label}{' '}
                  {card.trend && <TrendIcon className="size-4" />}
                </div>
                <div className="text-muted-foreground">
                  {card.footer.description}
                </div>
              </CardFooter>
            )}
          </Card>
        )
      })}
    </div>
  )
}
