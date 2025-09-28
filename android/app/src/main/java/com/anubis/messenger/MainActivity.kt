package com.anubis.messenger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.*
import com.squareup.moshi.Moshi
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AnubisTheme {
                App()
            }
        }
    }
}

// --- Simple API layer ---
data class LoginReq(val passphrase: String)
data class LoginRes(val accessToken: String, val user: User)
data class User(val username: String, val displayName: String?, val nickname: String?, val avatarUrl: String?)
data class InboxItem(val chatId: String, val peer: User, val lastMessage: Message)
data class Message(val id: String, val chatId: String, val type: String, val text: String?, val mediaUrl: String?, val createdAt: String)

interface Api {
    @POST("/api/auth/login") suspend fun login(@Body body: LoginReq): LoginRes
    @GET("/api/me") suspend fun me(@Header("Authorization") token: String): User
    @GET("/api/inbox") suspend fun inbox(@Header("Authorization") token: String): List<InboxItem>
    @GET("/api/messages") suspend fun messages(@Header("Authorization") token: String, @Query("with") withUser: String, @Query("limit") limit: Int = 50): List<Message>
    @POST("/api/messages") suspend fun send(@Header("Authorization") token: String, @Body body: Map<String, Any>): Message
}

@Composable
fun App() {
    val BASE_URL = BuildConfig.ANUBIS_API_URL
    val moshi = remember { Moshi.Builder().build() }
    val retrofit = remember {
      Retrofit.Builder().baseUrl(BASE_URL).addConverterFactory(MoshiConverterFactory.create(moshi)).build()
    }
    val api = remember { retrofit.create(Api::class.java) }
    var token by remember { mutableStateOf<String?>(null) }
    var pass by remember { mutableStateOf("") }
    var me by remember { mutableStateOf<User?>(null) }
    var inbox by remember { mutableStateOf(listOf<InboxItem>()) }
    var active by remember { mutableStateOf<User?>(null) }
    var msgs by remember { mutableStateOf(listOf<Message>()) }
    var text by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    var socket: Socket? by remember { mutableStateOf(null) }

    fun connectSocket(tok: String) {
        try {
            val opts = IO.Options()
            val auth = JSONObject()
            auth.put("token", tok)
            opts.auth = auth
            socket = IO.socket(BASE_URL, opts)
            socket?.on("message") { args ->
                val js = args.firstOrNull() as? JSONObject ?: return@on
                val textMsg = js.optString("text", null)
                val chatId = js.optString("chatId")
                val createdAt = js.optString("createdAt")
                val id = js.optString("id")
                val m = Message(id, chatId, js.optString("type"), textMsg, js.optString("mediaUrl", null), createdAt)
                if (active != null) {
                    val sender = js.optString("senderUsername")
                    val recipient = js.optString("recipientUsername")
                    if (sender == active!!.username || recipient == active!!.username) {
                        msgs = msgs + m
                    }
                }
                // refresh inbox
                scope.launch(Dispatchers.IO) {
                    val ih = api.inbox("Bearer $tok")
                    inbox = ih
                }
            }
            socket?.connect()
        } catch (_: Throwable) { }
    }

    Scaffold(topBar = {
        SmallTopAppBar(title = { Text("Anubis") })
    }) { pad ->
        Column(Modifier.padding(pad).padding(12.dp)) {
            if (token == null) {
                OutlinedTextField(pass, { pass = it }, label = { Text("Passphrase") }, singleLine = true)
                Spacer(Modifier.height(8.dp))
                Button(onClick = {
                    scope.launch(Dispatchers.IO) {
                        runCatching {
                            val r = api.login(LoginReq(pass))
                            token = r.accessToken
                            me = r.user
                            connectSocket(r.accessToken)
                            inbox = api.inbox("Bearer ${r.accessToken}")
                        }.onFailure { }
                    }
                }) { Text("Login") }
            } else if (active == null) {
                Text(text = "Hi, @${me?.username}")
                Spacer(Modifier.height(8.dp))
                LazyColumn {
                    items(inbox) { item ->
                        ListItem(
                            headlineContent = { Text(item.peer.displayName ?: item.peer.username) },
                            supportingContent = { Text(item.lastMessage.text ?: item.lastMessage.type) },
                            modifier = Modifier.fillMaxWidth(),
                            overlineContent = { Text("@${item.peer.username}") },
                            leadingContent = {}
                        ,
                            trailingContent = {
                                Text(item.lastMessage.createdAt.take(16).replace('T',' '))
                            }
                        )
                        Divider()
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = {
                            active = item.peer
                            scope.launch(Dispatchers.IO) {
                                val list = api.messages("Bearer ${token}", item.peer.username, 50)
                                msgs = list
                            }
                        }) { Text("Open") }
                        Spacer(Modifier.height(8.dp))
                    }
                }
            } else {
                Text(text = "Chat with @${active!!.username}")
                Spacer(Modifier.height(8.dp))
                LazyColumn(Modifier.weight(1f)) {
                    items(msgs) { m ->
                        Text(m.text ?: m.type)
                        Spacer(Modifier.height(4.dp))
                    }
                }
                Row {
                    OutlinedTextField(text, { text = it }, modifier = Modifier.weight(1f), label = { Text("Message") })
                    Spacer(Modifier.width(8.dp))
                    Button(onClick = {
                        val t = token ?: return@Button
                        val peer = active ?: return@Button
                        scope.launch(Dispatchers.IO) {
                            runCatching {
                                val m = api.send("Bearer $t", mapOf("to" to peer.username, "type" to "text", "text" to text))
                                msgs = msgs + m
                                text = ""
                            }
                        }
                    }) { Text("Send") }
                }
                Spacer(Modifier.height(8.dp))
                Button(onClick = { active = null }) { Text("Back") }
            }
        }
    }
}

@Preview
@Composable
fun PreviewGreeting() {
    AnubisTheme(darkTheme = isSystemInDarkTheme()) {
        App()
    }
}