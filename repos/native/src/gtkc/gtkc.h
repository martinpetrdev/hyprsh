#ifndef GTK_H
#define GTK_H

#include <cairo.h>
#include <gtk-layer-shell.h>
#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

void gtkc_set_input_region(GtkWidget *window, int x, int y, int w,
                           int h);
void gtkc_prefer_dark_theme(void);

#endif