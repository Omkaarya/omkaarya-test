import React from "react";
import { Badge } from "@/components/atoms/Badge";
import { Avatar } from "@/components/atoms/Avatar";
import { Icon } from "@/components/atoms/Icon";
import { DotsVerticalIcon } from "@/icons/duotone";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className = "", children, ...props }) => (
  <div
    className={`bg-surface rounded-xl border border-border shadow-xs overflow-hidden flex flex-col ${className}`}
    {...props}
  >
    {children}
  </div>
);

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: string; // Rich inline badge
  description?: React.ReactNode;
  
  // Avatar support for user card headers
  avatarSrc?: string;
  avatarInitials?: string;
  
  // Quick Actions (Buttons passed as children)
  actions?: React.ReactNode;
  onMenuClick?: () => void; // 3-dot dropdown trigger
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  badge,
  description,
  avatarSrc,
  avatarInitials,
  actions,
  onMenuClick,
  className = "",
  ...props
}) => (
  <div className={`px-6 py-5 border-b border-border flex flex-col sm:flex-row justify-between sm:items-start gap-4 ${className}`} {...props}>
    
    <div className="flex items-start gap-4">
      {(avatarSrc || avatarInitials) && (
        <Avatar src={avatarSrc} initials={avatarInitials} size="lg" />
      )}
      <div>
        <div className="flex items-center gap-3">
          {title && <h3 className="text-base font-semibold text-text-primary leading-tight">{title}</h3>}
          {badge && <Badge size="sm" color="orange">{badge}</Badge>}
        </div>
        {description && <p className="text-sm text-text-tertiary mt-1 leading-relaxed max-w-xl">{description}</p>}
      </div>
    </div>

    {/* Right Actions */}
    {(actions || onMenuClick) && (
      <div className="shrink-0 flex items-center gap-3 self-start sm:ml-auto">
        {actions}
        
        {onMenuClick && (
          <button 
            type="button"
            onClick={onMenuClick}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-subtle rounded-md transition-colors"
          >
            <Icon icon={DotsVerticalIcon} size="md" />
          </button>
        )}
      </div>
    )}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`px-6 py-5 flex-1 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`px-6 py-4 border-t border-border bg-subtle ${className}`} {...props}>
    {children}
  </div>
);
