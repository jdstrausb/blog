<script lang="ts">
    import type { Picture } from 'vite-imagetools';
    import { getEnhancedImage } from '$lib/utils/enhanced-images.client';

    interface Props {
        src: string;
        alt: string;
        size?: number;
        class?: string;
    }

    let { src, alt, size = 192, class: className = '' }: Props = $props();

    const borderWidth = 5;
    const outerSize = size + borderWidth * 2;
    const outerContainerStyle = `width: ${outerSize}px; height: ${outerSize}px;`;
    const innerContainerStyle = `width: ${size}px; height: ${size}px;`;

    const resolvedImage = $derived.by((): Picture | string => {
        const enhanced = getEnhancedImage(src);

        if (enhanced) {
            return enhanced;
        } else {
            return src;
        }
    });
</script>

{#if typeof resolvedImage === 'string'}
    <div class="avatar-container-border" style={outerContainerStyle}>
        <div class="avatar-container {className}" style={innerContainerStyle}>
            <img src={resolvedImage} {alt} class="avatar-image" />
        </div>
    </div>
{:else}
    <div class="avatar-container-border" style={outerContainerStyle}>
        <div class="avatar-container {className}" style={innerContainerStyle}>
            <enhanced:img src={resolvedImage} {alt} class="avatar-image" />
        </div>
    </div>
{/if}

<style>
    /* Superellipse support for Chrome/Chromium browsers */
    @supports (corner-shape: superellipse(5)) {
        .avatar-container-border {
            corner-shape: superellipse(1);
            border-radius: 45px;
            position: relative;
            padding: 5px;
            z-index: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-container-border::before {
            content: '';
            position: absolute;
            inset: 0;
            corner-shape: superellipse(1);
            border-radius: 45px;
            background: linear-gradient(
                60deg,
                #cb7676,
                #d4976c,
                #e6cc77,
                #4d9375,
                #5eaab5,
                #6394bf,
                #6872ab,
                #d9739f
            );
            z-index: -1;
            background-size: 300% 300%;
            animation: moveBorder 3s linear alternate infinite;
        }

        .avatar-container {
            corner-shape: superellipse(1);
            border-radius: 45px;
            position: relative;
            overflow: hidden;
            background-color: var(--bg-color);
        }

        @keyframes moveBorder {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
    }

    /* Fallback for browsers without superellipse support */
    @supports not (corner-shape: superellipse(5)) {
        .avatar-container-border {
            border-radius: 9999px;
            position: relative;
            padding: 5px;
            z-index: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-container-border::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background: linear-gradient(
                60deg,
                #cb7676,
                #d4976c,
                #e6cc77,
                #4d9375,
                #5eaab5,
                #6394bf,
                #6872ab,
                #d9739f
            );
            z-index: -1;
            background-size: 300% 300%;
            animation: moveBorderFallback 3s linear alternate infinite;
        }

        .avatar-container {
            border-radius: 9999px;
            position: relative;
            overflow: hidden;
            background-color: var(--bg-color);
        }

        @keyframes moveBorderFallback {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
    }

    .avatar-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
