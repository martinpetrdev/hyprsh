package main

import (
	"fmt"

	"hyprsh.martinpetr.dev/src/window"
)

func main() {
	fmt.Println("Starting...")

	window := window.Window{}

	window.Init()
	window.Create()
}
