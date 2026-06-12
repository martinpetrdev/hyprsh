package window

import (
	"unsafe"

	"hyprsh.martinpetr.dev/src/config"
	"hyprsh.martinpetr.dev/src/gtkc"
	"hyprsh.martinpetr.dev/src/system"
	"hyprsh.martinpetr.dev/src/webview"
)

type Window struct {
	gtkWindow *gtkc.GtkWidget
	webview   webview.GtkWidget
}

func (w *Window) Init() {
	gtkc.GtkInit()
}

func (w *Window) Create() {
	w.gtkWindow = gtkc.GtkWindowNewToplevel()
	w.webview = webview.CreateWebview()

	sw, _ := system.GetScreenSize()

	gtkc.GtkcApplyTransparencyVisual(w.gtkWindow)
	gtkc.GtkWidgetSetAppPaintable(w.gtkWindow)
	gtkc.GtkcSetLayerShell(w.gtkWindow)
	gtkc.GtkcSetNamespace(w.gtkWindow, config.ProjectNamespace)
	gtkc.GtkcSetAnchorAndSize(w.gtkWindow, sw, 200, 0)

	webview.SetWebviewBackground(w.webview)
	webview.AllowAccessToLocalFiles(w.webview)
	webview.LoadURI(w.webview, "https://example.com")

	gtkc.GtkContainerAdd(w.gtkWindow, (*gtkc.GtkWidget)(unsafe.Pointer(w.webview)))

	gtkc.GtkWindowShow(w.gtkWindow)
	gtkc.GtkMain()
}
