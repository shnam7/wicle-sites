import {offcanvas} from 'wicle/ui/offcanvas'
import jQuery from 'jquery'
import * as wilce from './wicle/index.ts'

wilce.nav()

offcanvas()

for (const control of document.querySelectorAll<HTMLElement>('input[name=mode]')) {
    control.addEventListener('change', e => {
        const radio = e.currentTarget as HTMLInputElement
        if (radio.checked) {
            for (const el of document.querySelectorAll<HTMLElement>('[data-control*=wz-control-]')) {
                jQuery(el).data('mode', radio.value)
            }
        }
    })
}
