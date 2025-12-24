import { useState, useEffect } from 'react'

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calculateTimeLeft(): TimeLeft {
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

interface CountdownProps {
    isMobile: boolean
}

export function Countdown({ isMobile }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: isMobile ? 70 : 90,
        left: isMobile ? 15 : 20,
        zIndex: 20,
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
    }

    const unitStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '8px 10px' : '12px 16px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: isMobile ? '50px' : '65px',
    }

    const numberStyle: React.CSSProperties = {
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        fontSize: isMobile ? '1.4rem' : '1.8rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        letterSpacing: '-0.02em',
    }

    const labelStyle: React.CSSProperties = {
        fontSize: isMobile ? '0.6rem' : '0.7rem',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginTop: '4px',
    }

    const separatorStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        color: 'rgba(255,215,0,0.6)',
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        fontWeight: 300,
        marginTop: '-8px',
    }

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    const units = [
        { value: timeLeft.days, label: 'day' },
        { value: timeLeft.hours, label: 'hour' },
        { value: timeLeft.minutes, label: 'minute' },
        { value: timeLeft.seconds, label: 'second' },
    ]

    return (
        <div style={containerStyle}>
            {units.map((unit, index) => (
                <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
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
    )
}
