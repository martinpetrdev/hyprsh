package system

/*
#cgo pkg-config: gtk+-3.0
#include <gtk/gtk.h>
*/
import "C"

func GetScreenSize() (int, int) {
	display := C.gdk_display_get_default()
	monitor := C.gdk_display_get_monitor(display, 0)

	var geometry C.GdkRectangle
	C.gdk_monitor_get_geometry(monitor, &geometry)

	return int(geometry.width), int(geometry.height)
}
