Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run chr(34) & "13_consensus_silent.sh" & Chr(34), 0
Set WshShell = Nothing