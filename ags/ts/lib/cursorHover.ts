import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk?version=3.0';

export function setupCursorHover(button: Gtk.Button) {
    const display = Gdk.Display.get_default();
    button.connect('enter-notify-event', () => {
        const cursor = Gdk.Cursor.new_from_name(display, 'pointer');
        button.get_window().set_cursor(cursor);
    });

    button.connect('leave-notify-event', () => {
        const cursor = Gdk.Cursor.new_from_name(display, 'default');
        button.get_window().set_cursor(cursor);
    });
}

export function setupCursorHoverAim(button: Gtk.Button) {
    button.connect('enter-notify-event', () => {
        const display = Gdk.Display.get_default();
        const cursor = Gdk.Cursor.new_from_name(display, 'crosshair');
        button.get_window().set_cursor(cursor);
    });

    button.connect('leave-notify-event', () => {
        const display = Gdk.Display.get_default();
        const cursor = Gdk.Cursor.new_from_name(display, 'default');
        button.get_window().set_cursor(cursor);
    });
}

export function setupCursorHoverGrab(button: Gtk.Button) {
    button.connect('enter-notify-event', () => {
        const display = Gdk.Display.get_default();
        const cursor = Gdk.Cursor.new_from_name(display, 'grab');
        button.get_window().set_cursor(cursor);
    });

    button.connect('leave-notify-event', () => {
        const display = Gdk.Display.get_default();
        const cursor = Gdk.Cursor.new_from_name(display, 'default');
        button.get_window().set_cursor(cursor);
    });
}
