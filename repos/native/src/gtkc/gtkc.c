#include "gtkc.h"
#include <cairo.h>
#include <gtk-layer-shell.h>
#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

void gtkc_set_input_region(GtkWidget *window, int x, int y, int w, int h) {
  cairo_region_t *region = cairo_region_create();
  cairo_rectangle_int_t rect;

  rect.x = x;
  rect.y = y;
  rect.width = w;
  rect.height = h;

  cairo_region_union_rectangle(region, &rect);
  gtk_widget_input_shape_combine_region(window, region);
  cairo_region_destroy(region);
}
