package com.anubis.messenger

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Primary = Color(0xFF6F0035)
private val Secondary = Color(0xFF531A50)

private val LightColors: ColorScheme = lightColorScheme(
    primary = Primary,
    secondary = Secondary
)

private val DarkColors: ColorScheme = darkColorScheme(
    primary = Primary,
    secondary = Secondary
)

@Composable
fun AnubisTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content
    )
}