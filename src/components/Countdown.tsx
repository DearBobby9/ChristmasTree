import { useState, useEffect } from 'react'

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calculateTimeUntilChristmas(): TimeLeft {
    const christmas = new Date(new Date().getFullYear(), 11, 25) // December 25
    const now = new Date()

    // If Christmas has passed this year, target next year
    if (now > christmas) {
        christmas.setFullYear(christmas.getFullYear() + 1)
    }

    const difference = christmas.getTime() - now.getTime()

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    }
}

function calculateTimeUntilNewYear(): TimeLeft {
    const newYear = new Date(new Date().getFullYear() + 1, 0, 1) // January 1 next year
    const now = new Date()

    const difference = newYear.getTime() - now.getTime()

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    }
}

interface CountdownProps {
    isMobile: boolean
}

interface CountdownRowProps {
    title: string
    timeLeft: TimeLeft
    isMobile: boolean
    accentColor: string
    icon: string
}

function CountdownRow({ title, timeLeft, isMobile, accentColor, icon }: CountdownRowProps) {
    const unitStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: isMobile ? '10px' : '14px',
        padding: isMobile ? '6px 8px' : '10px 14px',
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${accentColor}15`,
        minWidth: isMobile ? '42px' : '58px',
    }

    const numberStyle: React.CSSProperties = {
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        fontWeight: 700,
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.02em',
    }

    const labelStyle: React.CSSProperties = {
        fontSize: isMobile ? '0.5rem' : '0.6rem',
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginTop: '2px',
    }

    const separatorStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        color: `${accentColor}80`,
        fontSize: isMobile ? '1rem' : '1.2rem',
        fontWeight: 300,
        marginTop: '-6px',
    }

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    const units = [
        { value: timeLeft.days, label: 'day' },
        { value: timeLeft.hours, label: 'hr' },
        { value: timeLeft.minutes, label: 'min' },
        { value: timeLeft.seconds, label: 'sec' },
    ]

    return (
        <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            {/* Title */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: isMobile ? '6px' : '8px',
            }}>
                <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{icon}</span>
                <span style={{
                    fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                    fontWeight: 500,
                    color: accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    textShadow: `0 0 20px ${accentColor}50`,
                }}>
                    {title}
                </span>
            </div>

            {/* Countdown Units */}
            <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px' }}>
                {units.map((unit, index) => (
                    <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
                        <div style={unitStyle}>
                            <span style={numberStyle}>{formatNumber(unit.value)}</span>
                            <span style={labelStyle}>{unit.label}</span>
                        </div>
                        {index < units.length - 1 && (
                            <span style={separatorStyle}>:</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function Countdown({ isMobile }: CountdownProps) {
    const [christmasTime, setChristmasTime] = useState<TimeLeft>(calculateTimeUntilChristmas())
    const [newYearTime, setNewYearTime] = useState<TimeLeft>(calculateTimeUntilNewYear())

    useEffect(() => {
        const timer = setInterval(() => {
            setChristmasTime(calculateTimeUntilChristmas())
            setNewYearTime(calculateTimeUntilNewYear())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: isMobile ? 65 : 85,
        left: isMobile ? 15 : 20,
        zIndex: 20,
    }

    return (
        <div style={containerStyle}>
            <CountdownRow
                title="Until Christmas"
                timeLeft={christmasTime}
                isMobile={isMobile}
                accentColor="#FFD700"
                icon="🎄"
            />
            <CountdownRow
                title="Until New Year"
                timeLeft={newYearTime}
                isMobile={isMobile}
                accentColor="#00D4FF"
                icon="🎆"
            />
        </div>
    )
}
