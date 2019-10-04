exports.discovery = (title) => {
    return [
        '',
        '01-background/',
        '02-requirements/',
        {
            title: '设置开发环境',
            collapsable: true,
            children: [
            '03-setup/',
            '03-setup/linux',
            '03-setup/windows',
            '03-setup/macos',
            '03-setup/verify'
            ]
        },
        '04-meet-your-hardware/',
        {
            title: 'LED轮盘灯',
            collapsable: true,
            children: [
            '05-led-roulette/',
            '05-led-roulette/build-it',
            '05-led-roulette/debug-it',
            '05-led-roulette/flash-it',
            '05-led-roulette/the-led-and-delay-abstractions',
            '05-led-roulette/the-challenge',
            '05-led-roulette/my-solution'
            ]
        },
        {
            title: 'Hello-World',
            collapsable: true,
            children: [
            '06-hello-world/',
            '06-hello-world/panic'
            ]
        },
        {
            title: '寄存器',
            collapsable: true,
            children: [
            '07-registers/',
            '07-registers/rtrm',
            '07-registers/optimization',
            '07-registers/bad-address',
            '07-registers/spooky-action-at-a-distance',
            '07-registers/type-safe-manipulation'
            ]
        },
        {
            title: '再解LED',
            collapsable: true,
            children: [
            '08-leds-again/',
            '08-leds-again/power',
            '08-leds-again/configuration',
            '08-leds-again/the-solution'
            ]
        },
        {
            title: '时钟和计时器',
            collapsable: true,
            children: [
            '09-clocks-and-timers/',
            '09-clocks-and-timers/for-loop-delays',
            '09-clocks-and-timers/nop',
            '09-clocks-and-timers/one-shot-timer',
            '09-clocks-and-timers/initialization',
            '09-clocks-and-timers/busy-waiting',
            '09-clocks-and-timers/putting-it-all-together'
            ]
        },
        {
            title: '串行通信',
            collapsable: true,
            children: [
            '10-serial-communication/',
            '10-serial-communication/nix-tooling',
            '10-serial-communication/windows-tooling',
            '10-serial-communication/loopbacks'
            ]
        },
        {
            title: 'USART',
            collapsable: true,
            children: [
            '11-usart/',
            '11-usart/send-a-single-byte',
            '11-usart/send-a-string',
            '11-usart/buffer-overrun',
            '11-usart/uprintln',
            '11-usart/receive-a-single-byte',
            '11-usart/echo-server',
            '11-usart/reverse-a-string',
            '11-usart/my-solution'
            ]
        },
        {
            title: '蓝牙设置',
            collapsable: true,
            children: [
            '12-bluetooth-setup/',
            '12-bluetooth-setup/linux',
            '12-bluetooth-setup/loopback'
            ]
        },
        '13-serial-over-bluetooth/',
        {
            title: 'I2C',
            collapsable: true,
            children: [
            '14-i2c/',
            '14-i2c/the-general-protocol',
            '14-i2c/lsm303dlhc',
            '14-i2c/read-a-single-register',
            '14-i2c/the-solution',
            '14-i2c/read-several-registers'
            ]
        },
        {
            title: 'LED开发指南',
            collapsable: true,
            children: [
            '15-led-compass/',
            '15-led-compass/take-1',
            '15-led-compass/solution-1',
            '15-led-compass/take-2',
            '15-led-compass/solution-2',
            '15-led-compass/magnitude',
            '15-led-compass/calibration'
            ]
        },
        {
            title: 'punch-o-meter',
            collapsable: true,
            children: [
            '16-punch-o-meter/',
            '16-punch-o-meter/gravity-is-up',
            '16-punch-o-meter/the-challenge',
            '16-punch-o-meter/my-solution'
            ]
        },
        'explore',
        'appendix/1-general-troubleshooting'

    ]
}