# This is a simple Python script to reset the AwF servers and do magic on them after resetting - setting permissions etc.

import subprocess
import sys


servers = {
    1: "chronotrain",
    2: "corona-daycare",
    3: "event-biter-battles",
    4: "members-core",
    5: "members-islandic",
    6: "members-krastorio2",
    7: "members-seablock",
    8: "members-spidertron",
    9: "test",
}


def ask():
    # ask user for server to be removed
    print("Which server should be reset:")
    for i in servers:
        print(i, "-", servers[i])
    sel = int(input("input: "))

    print("Server {0}, '{1}' selected and will be reset".format(sel, servers[int(sel)]))
    confirm1 = input("Confirm with Yes/n: ")
    if confirm1 == "n":
        return 0  # no
    elif confirm1 == "Yes":
        confirm2 = input("Please confirm again (Yes/n): ")
        if confirm2 == "Yes":
            return sel
        else:
            return 0
    else:
        return 0


def removeFiles(ans):
    dir = "../servers/" + servers[ans]
    print(dir)
    files = "saves"  # put the folder/filenames in here, separated with spaces. this will completely wipe them
    # subprocess.call(['rm','-rf' + files]  #remove save files
    return 0


def run():
    ans = ask()
    if ans == 0:
        print("Operation cancelled. Script terminating..")
        sys.exit()
    else:
        print(
            "Proceeding to remove & reset server number {0}, '{1}'..".format(
                ans, servers[ans]
            )
        )
        removeFiles(ans)


run()
