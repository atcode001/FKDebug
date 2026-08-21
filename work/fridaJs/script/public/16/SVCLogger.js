
function SVCLogger(callback) {
    this.svc_context = {};
    this.cb = callback;
    this.svcId_names = [
        "io_setup", "io_destroy", "io_submit", "io_cancel", "io_getevents", "setxattr", "lsetxattr", "fsetxattr", "getxattr", "lgetxattr", "fgetxattr", "listxattr", "llistxattr", "flistxattr",
        "removexattr", "lremovexattr", "fremovexattr", "getcwd", "lookup_dcookie", "eventfd2", "epoll_create1", "epoll_ctl", "epoll_pwait", "dup", "dup3", "fcntl", "inotify_init1", "inotify_add_watch",
        "inotify_rm_watch", "ioctl", "ioprio_set", "ioprio_get", "flock", "mknodat", "mkdirat", "unlinkat", "symlinkat", "linkat", "renameat", "umount2", "mount", "pivot_root", "nfsservctl", "statfs",
        "fstatfs", "truncate", "ftruncate", "fallocate", "faccessat", "chdir", "fchdir", "chroot", "fchmod", "fchmodat", "fchownat", "fchown", "openat", "close", "vhangup", "pipe2", "quotactl", "getdents64",
        "lseek", "read", "write", "readv", "writev", "pread64", "pwrite64", "preadv", "pwritev", "sendfile", "pselect6", "ppoll", "signalfd4", "vmsplice", "splice", "tee", "readlinkat", "newfstatat", "fstat",
        "sync", "fsync", "fdatasync", "sync_file_range", "timerfd_create", "timerfd_settime", "timerfd_gettime", "utimensat", "acct", "capget", "capset", "personality", "exit", "exit_group", "waitid",
        "set_tid_address", "unshare", "futex", "set_robust_list", "get_robust_list", "nanosleep", "getitimer", "setitimer", "kexec_load", "init_module", "delete_module", "timer_create", "timer_gettime",
        "timer_getoverrun", "timer_settime", "timer_delete", "clock_settime", "clock_gettime", "clock_getres", "clock_nanosleep", "syslog", "ptrace", "sched_setparam", "sched_setscheduler", "sched_getscheduler",
        "sched_getparam", "sched_setaffinity", "sched_getaffinity", "sched_yield", "sched_get_priority_max", "sched_get_priority_min", "sched_rr_get_interval", "restart_syscall", "kill", "tkill", "tgkill",
        "sigaltstack", "rt_sigsuspend", "rt_sigaction", "rt_sigprocmask", "rt_sigpending", "rt_sigtimedwait", "rt_sigqueueinfo", "rt_sigreturn", "setpriority", "getpriority", "reboot", "setregid", "setgid",
        "setreuid", "setuid", "setresuid", "getresuid", "setresgid", "getresgid", "setfsuid", "setfsgid", "times", "setpgid", "getpgid", "getsid", "setsid", "getgroups", "setgroups", "uname", "sethostname",
        "setdomainname", "getrlimit", "setrlimit", "getrusage", "umask", "prctl", "getcpu", "gettimeofday", "settimeofday", "adjtimex", "getpid", "getppid", "getuid", "geteuid", "getgid", "getegid", "gettid",
        "sysinfo", "mq_open", "mq_unlink", "mq_timedsend", "mq_timedreceive", "mq_notify", "mq_getsetattr", "msgget", "msgctl", "msgrcv", "msgsnd", "semget", "semctl", "semtimedop", "semop", "shmget", "shmctl",
        "shmat", "shmdt", "socket", "socketpair", "bind", "listen", "accept", "connect", "getsockname", "getpeername", "sendto", "recvfrom", "setsockopt", "getsockopt", "shutdown", "sendmsg", "recvmsg", "readahead",
        "brk", "munmap", "mremap", "add_key", "request_key", "keyctl", "clone", "execve", "mmap", "fadvise64", "swapon", "swapoff", "mprotect", "msync", "mlock", "munlock", "mlockall", "munlockall", "mincore", "madvise",
        "remap_file_pages", "mbind", "get_mempolicy", "set_mempolicy", "migrate_pages", "move_pages", "rt_tgsigqueueinfo", "perf_event_open", "accept4", "recvmmsg", "not implemented", "not implemented", "not implemented",
        "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented", "not implemented",
        "not implemented", "not implemented", "wait4", "prlimit64", "fanotify_init", "fanotify_mark", "name_to_handle_at", "open_by_handle_at", "clock_adjtime", "syncfs", "setns", "sendmmsg", "process_vm_readv",
        "process_vm_writev", "kcmp", "finit_module", "sched_setattr", "sched_getattr", "renameat2", "seccomp", "getrandom", "memfd_create", "bpf", "execveat", "userfaultfd", "membarrier", "mlock2", "copy_file_range",
        "preadv2", "pwritev2", "pkey_mprotect", "pkey_alloc", "pkey_free", "statx"];

    this.svcEnter = function (context, offset) {
        var svcId = context.x8;
        var name = this.svcId_names[parseInt(context.x8)];
        var logs = { type: "svc", name: name, svcId: svcId, offset: offset.toString(16), event: "enter" };
        // fKLog.kCLog(logs);
        switch (name) {
            case "process_vm_readv":
                {
                    logs.pid = parseInt(context.x0);
                    logs.local_iov = {};

                    logs.local_iov.iov_base = context.x1.readPointer();
                    logs.local_iov.iov_len = context.x1.add(8).readPointer();

                    logs.liovcnt = context.x2;
                    logs.remote_iov = {};
                    logs.remote_iov.iov_base = context.x3.readPointer();
                    logs.remote_iov.iov_len = context.x3.add(8).readPointer();

                    logs.riovcnt = context.x4;
                    logs.flags = context.x5;
                    break;
                }
            case "sendto":
                {
                    var fd = parseInt(context.x0);
                    var bufPtr = context.x1;
                    var buflen = parseInt(context.x2);
                    var flags = parseInt(context.x3);
                    var destPtr = context.x4;
                    var addrlen = parseInt(context.x5);

                    var destInfo = null;
                    try {
                        destInfo = parseSockaddr(destPtr, addrlen);
                    } catch (e) {
                        destInfo = null;
                        console.log(e);
                    }

                    var preview = '<no-data>';
                    try {
                        if (bufPtr && !bufPtr.isNull() && buflen > 0) {
                            var n = Math.min(64, buflen);
                            var ba = Memory.readByteArray(bufPtr, n);
                            preview = bytesToHex(ba);
                        }
                    } catch (e) { preview = '<read-error>'; }

                    logs.fd = fd;
                    logs.flags = flags;
                    logs.data_preview = preview;
                    logs.addrlen = addrlen;
                    logs.dest = destInfo;
                    logs.context = context;
                    // 可选：把目标 fd 对应路径也解析出来（如果需要）
                    try {
                        if (typeof fdToPath === 'function') {
                            logs.fd_path = fdToPath(fd);
                        }
                    } catch (e) { }
                    break;
                }
            case "getdents64":
                {
                    logs.bufPtr = context.x1;
                    logs.fd = context.x0;
                    logs.bufSize = context.x2;
                    logs.path = fdToPath(context.x0);
                    break;
                }
            case "fstat":
                {
                    logs.path = fdToPath(context.x0);
                    break;
                }
            case "statfs":
                logs.path = context.x0.readCString();
                break;
            case "openat":
                //int openat(int dirfd, const char *pathname, int flags, mode_t mode);
                logs.dirfd = context.x0;
                logs.path = context.x1.readCString();
                logs.flags = context.x2;
                logs.mode = context.x3;
                break;
            case "newfstatat":
                logs.path = context.x1.readCString()
                break;
            case "faccessat":
                {
                    logs.path = context.x1.readCString()
                    logs.mode = context.x2;
                    logs.flag = context.x3;
                    break;
                }
            case "mprotect":
                {
                    logs.address = context.x0;
                    logs.pageSize = context.x1;

                    var n = context.x2;
                    var r = (n & 1) ? 'r' : '-';
                    var w = (n & 2) ? 'w' : '-';
                    var x = (n & 4) ? 'x' : '-';
                    logs.protect = context.x2
                    logs.rwx = r + w + x;
                    break;
                }
            case "getpid":
            case "getppid":
            case "socket":
                break;
            case "recvfrom":
                logs._bufPtr = context.x1;
                break;
            case "read":
                {
                    //ssize_t read(int fd, void *buf, size_t count)
                    logs.path = fdToPath(context.x0);
                    logs.buf = context.x1;
                    logs.count = context.x2;
                    logs.fd = context.x0;
                    break;
                }
            case "close":
                logs.path = fdToPath(context.x0);
                logs.fd = context.x0;
                break;
            case "uname": {
                logs.x0 = context.x0
                break;
            }
            default:
                logs.context = context;
                break;
        }

        if (this.cb != undefined) {
            this.cb(offset, logs, context)
        }
        this.svc_context[getCTid()] = logs;
        return logs;
    }
    this.get_proc_path = function (path) {
        if (path == null || !path.startsWith("/proc/") || path.startsWith("/proc/self/")) {
            return path;
        }

        // 去掉前缀 "/proc/"
        var rest = path.slice(6);
        var sep = rest.indexOf('/');
        if (sep === -1) return path; // 无尾部
        var tail = rest.slice(sep + 1);

        var start = "/proc/" + getPid() + "/";
        if (path.startsWith(start)) {
            return "/proc/self/" + tail;
        }
        return path;
    }
    this.svcLeave = function (context, offset) {

        var tidKey = (typeof getCTid === 'function') ? getCTid() : Process.getCurrentThreadId();
        var logs = this.svc_context[tidKey];

        // 如果找不到 enter 信息，尽量构造基础信息
        if (!logs) {
            var svcId = context.x8;
            var name = this.svcId_names[parseInt(svcId)];
            logs = { type: "svc", name: name, svcId: svcId, offset: offset.toString(16), event: "leave", tid: tidKey };
        } else {
            logs.event = "leave";
        }

        // 返回值通常保存在 x0
        var retval = context.x0;
        logs.retval = ptr(retval);
        //fKLog.kCLog(logs);

        // 记录 errno（若 syscall 返回负值，通常表示 -errno）
        if (typeof retval === 'number' && retval < 0) {
            logs.errno = -retval;
            logs.error = "errno:" + (-retval);
        }

        // 针对不同 syscall 补充信息
        switch (logs.name) {
            case "process_vm_readv":
                break;
            case "uname":
                {                    
                    logs.sysname = logs.x0.readCString();
                    logs.nodename = logs.x0.add(65 * 1).readCString();
                    logs.release = logs.x0.add(65 * 2).readCString();
                    logs.version = logs.x0.add(65 * 3).readCString();
                    logs.machine = logs.x0.add(65 * 4).readCString();
                    break;
                }
            case "faccessat":
                {
                    logs.path = this.get_proc_path(logs.path);

                    //if (logs.path == "/system/xbin" || logs.path == "/dev/su" || logs.path == "/bin/su") {
                    //    if (logs.retval != ptr(-2)) {
                    //        logs.reset_retval = ptr(-2);
                    //        logs.desc = "shell权限有误";
                    //    }
                    //}
                    //if (logs.path == "/dev" || logs.path == "/bin" || logs.path == "/sys/block") {
                    //    logs.reset_retval = ptr(-13);
                    //}
                    break;
                }
            case "openat": {
                logs.pathPtr = context.x0;
                logs.path = this.get_proc_path(logs.path);
                //if (
                //    logs.path == "/dev" || logs.path == "/proc/modules" ||
                //    logs.path == "/proc/bus/pci/devices"
                //    || logs.path == "/proc/interrupts"
                //    || logs.path == "/sys/devices/virtual/android_usb/android0/state"
                //    || logs.path == "/sys/block"
                //) {
                //    logs.reset_retval = ptr(-13);
                //}
                break;
            }
            case "sendto":
            case "send":
            case "sendmsg":
                // 发送字节数
                logs.sent = retval;
                break;
            case "close":
            case "newfstatat":
            case "fstat":
            case "read":
                logs.path = this.get_proc_path(logs.path);
                break;
            case "recv":
            case "recvfrom":
                //读取到的数据，如果 enter 时保存了 buf 指针则读取
                if (logs._bufPtr && retval > 0) {
                    try {
                        var n = Math.min(retval, 256);
                        var ba = Memory.readByteArray(ptr(logs._bufPtr), n);
                        logs.data = fkConvert.bytesToHex(ba);
                    } catch (e) {
                        logs.data_read_error = "" + e;
                    }
                } else {
                    logs.read_bytes = retval;
                }
                break;
            case "getdents64":
            case "readahead":
                logs.result = retval;
                break;
            default:
                // 为通用场景记录上下文快照（节省体积：只记录寄存器 x0..x3） 
                logs.ret_context = {
                    x0: context.x0,
                    x1: context.x1,
                    x2: context.x2,
                    x3: context.x3
                };
                break;
        }


        if (this.cb != undefined) {
            this.cb(offset, logs, context);
        }
        // 清理上下文缓存
        try { delete svc_context[tidKey]; } catch (e) { }
        return logs;
    }
}
//SVCLogger End 