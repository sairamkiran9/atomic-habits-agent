// Mock lucide-react to avoid ESM issues in Jest
const React = require('react')

const createIcon = (name: string) => {
  const Icon = ({ className, ...props }: any) =>
    React.createElement('svg', { 'data-testid': `icon-${name}`, className, ...props })
  Icon.displayName = name
  return Icon
}

export const Archive = createIcon('Archive')
export const Check = createIcon('Check')
export const ChevronDown = createIcon('ChevronDown')
export const ChevronUp = createIcon('ChevronUp')
export const ChevronRight = createIcon('ChevronRight')
export const ChevronLeft = createIcon('ChevronLeft')
export const ArchiveRestore = createIcon('ArchiveRestore')
export const BarChart2 = createIcon('BarChart2')
export const BookOpen = createIcon('BookOpen')
export const Brain = createIcon('Brain')
export const Briefcase = createIcon('Briefcase')
export const CheckCircle2 = createIcon('CheckCircle2')
export const Circle = createIcon('Circle')
export const Dumbbell = createIcon('Dumbbell')
export const Edit2 = createIcon('Edit2')
export const Flame = createIcon('Flame')
export const Grid = createIcon('Grid')
export const Heart = createIcon('Heart')
export const Menu = createIcon('Menu')
export const Plus = createIcon('Plus')
export const Star = createIcon('Star')
export const Trash2 = createIcon('Trash2')
export const Users = createIcon('Users')
export const X = createIcon('X')
